import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Job } from 'bullmq';
import { Auction, AuctionStatus } from '../auctions/auction.entity';
import { Bid } from '../bids/bid.entity';
import { AuctionGateway } from '../socket/auction.gateway';

@Processor('auction-settlement')
@Injectable()
export class SettlementWorker extends WorkerHost {
    private readonly logger = new Logger(SettlementWorker.name);

    constructor(
        @InjectRepository(Auction)
        private auctionsRepo: Repository<Auction>,
        @InjectRepository(Bid)
        private bidsRepo: Repository<Bid>,
        private dataSource: DataSource,
        private auctionGateway: AuctionGateway,
    ) {
        super();
    }

    async process(job: Job<{ auctionId: string }>): Promise<void> {
        const { auctionId } = job.data;
        this.logger.log(`Processing settlement for auction ${auctionId}`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Lock auction row
            const auction = await queryRunner.manager
                .createQueryBuilder(Auction, 'auction')
                .setLock('pessimistic_write')
                .where('auction.id = :id', { id: auctionId })
                .getOne();

            if (!auction) {
                this.logger.warn(`Auction ${auctionId} not found`);
                await queryRunner.commitTransaction();
                return;
            }

            // Idempotency check: don't settle if already settled
            if (auction.status === AuctionStatus.SETTLED) {
                this.logger.log(`Auction ${auctionId} already settled, skipping`);
                await queryRunner.commitTransaction();
                return;
            }

            // Find highest bid
            const highestBid = await queryRunner.manager
                .createQueryBuilder(Bid, 'bid')
                .leftJoinAndSelect('bid.bidder', 'bidder')
                .where('bid.auctionId = :auctionId', { auctionId })
                .orderBy('bid.amount', 'DESC')
                .getOne();

            // Settle the auction
            if (highestBid) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Auction)
                    .set({
                        status: AuctionStatus.SETTLED,
                        winnerId: highestBid.bidderId,
                        currentPrice: highestBid.amount,
                    })
                    .where('id = :id', { id: auctionId })
                    .execute();

                await queryRunner.commitTransaction();

                // Post-commit: Emit AUCTION_ENDED
                this.auctionGateway.emitAuctionEnded(
                    auctionId,
                    highestBid.bidder
                        ? {
                            id: highestBid.bidder.id,
                            email: highestBid.bidder.email,
                            name: highestBid.bidder.name,
                        }
                        : null,
                    Number(highestBid.amount),
                );

                this.logger.log(
                    `Auction ${auctionId} settled. Winner: ${highestBid.bidderId}, Price: ${highestBid.amount}`,
                );
            } else {
                // No bids — set to ENDED
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Auction)
                    .set({ status: AuctionStatus.ENDED })
                    .where('id = :id', { id: auctionId })
                    .execute();

                await queryRunner.commitTransaction();

                this.auctionGateway.emitAuctionEnded(auctionId, null, 0);

                this.logger.log(`Auction ${auctionId} ended with no bids`);
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Settlement failed for auction ${auctionId}:`, error);
            throw error; // Let BullMQ retry
        } finally {
            await queryRunner.release();
        }
    }
}
