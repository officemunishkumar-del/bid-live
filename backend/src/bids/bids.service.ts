import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bid } from './bid.entity';
import { Auction, AuctionStatus } from '../auctions/auction.entity';
import { User } from '../users/user.entity';
import { AuctionGateway } from '../socket/auction.gateway';

@Injectable()
export class BidsService {
    constructor(
        @InjectRepository(Bid)
        private bidsRepo: Repository<Bid>,
        @InjectRepository(Auction)
        private auctionsRepo: Repository<Auction>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        private dataSource: DataSource,
        private auctionGateway: AuctionGateway,
    ) { }

    /**
     * Place a bid with pessimistic locking to prevent race conditions.
     * 
     * Transaction flow:
     * 1. Lock auction row (SELECT ... FOR UPDATE)
     * 2. Validate auction status and expiry (INSIDE the lock)
     * 3. Validate bid amount > current price
     * 4. Validate bidder balance >= amount
     * 5. Deduct amount from bidder balance
     * 6. Refund previous highest bidder
     * 7. Update auction current price
     * 8. Create bid record
     * 9. Commit → Emit NEW_BID via WebSocket
     */
    async placeBid(auctionId: string, bidderId: string, amount: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Lock auction row with pessimistic lock
            const auction = await queryRunner.manager
                .createQueryBuilder(Auction, 'auction')
                .setLock('pessimistic_write')
                .where('auction.id = :id', { id: auctionId })
                .getOne();

            if (!auction) {
                throw new BadRequestException('Auction not found');
            }

            // 2. Validate auction status (INSIDE the lock!)
            if (auction.status !== AuctionStatus.ACTIVE) {
                throw new ConflictException('Auction has ended');
            }

            // Check expiry inside the transaction
            if (new Date(auction.endsAt) <= new Date()) {
                throw new ConflictException('Auction has expired');
            }

            // 3. Validate bid amount
            if (amount <= Number(auction.currentPrice)) {
                throw new ConflictException(
                    `Bid must be greater than current price of ${auction.currentPrice}`,
                );
            }

            // 4. Lock and validate bidder balance
            const bidder = await queryRunner.manager
                .createQueryBuilder(User, 'user')
                .setLock('pessimistic_write')
                .where('user.id = :id', { id: bidderId })
                .getOne();

            if (!bidder) {
                throw new BadRequestException('User not found');
            }

            // Prevent bidding on own auction
            if (auction.creatorId === bidderId) {
                throw new ForbiddenException('Cannot bid on your own auction');
            }

            if (Number(bidder.balance) < amount) {
                throw new ForbiddenException('Insufficient balance');
            }

            // 5. Deduct amount from bidder's balance
            await queryRunner.manager
                .createQueryBuilder()
                .update(User)
                .set({ balance: () => `balance - ${amount}` })
                .where('id = :id', { id: bidderId })
                .execute();

            // 6. Refund previous highest bidder (if exists)
            const previousHighestBid = await queryRunner.manager
                .createQueryBuilder(Bid, 'bid')
                .where('bid.auctionId = :auctionId', { auctionId })
                .orderBy('bid.amount', 'DESC')
                .getOne();

            if (previousHighestBid && previousHighestBid.bidderId !== bidderId) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(User)
                    .set({ balance: () => `balance + ${Number(previousHighestBid.amount)}` })
                    .where('id = :id', { id: previousHighestBid.bidderId })
                    .execute();
            }

            // If the same bidder was already the highest bidder, refund the difference
            if (previousHighestBid && previousHighestBid.bidderId === bidderId) {
                // They already had the previous amount deducted, refund it
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(User)
                    .set({ balance: () => `balance + ${Number(previousHighestBid.amount)}` })
                    .where('id = :id', { id: bidderId })
                    .execute();
            }

            // 7. Update auction current price
            await queryRunner.manager
                .createQueryBuilder()
                .update(Auction)
                .set({ currentPrice: amount })
                .where('id = :id', { id: auctionId })
                .execute();

            // 8. Create bid record
            const bid = queryRunner.manager.create(Bid, {
                amount,
                auctionId,
                bidderId,
            });
            const savedBid = await queryRunner.manager.save(bid);

            // 9. Commit
            await queryRunner.commitTransaction();

            // Post-commit: Emit NEW_BID via WebSocket
            this.auctionGateway.emitNewBid(auctionId, {
                id: savedBid.id,
                amount: Number(savedBid.amount),
                bidder: {
                    id: bidder.id,
                    email: bidder.email,
                    name: bidder.name,
                },
                placedAt: savedBid.placedAt,
            });

            return {
                id: savedBid.id,
                amount: Number(savedBid.amount),
                auctionId,
                placedAt: savedBid.placedAt,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            // Emit BID_REJECTED via WebSocket so the user gets real-time feedback
            try {
                this.auctionGateway.emitBidRejected(
                    auctionId,
                    bidderId,
                    error.message || 'Bid rejected',
                );
            } catch (emitError) {
                // Don't let emission failure mask the original error
            }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getBidHistory(auctionId: string) {
        const bids = await this.bidsRepo.find({
            where: { auctionId },
            relations: ['bidder'],
            order: { placedAt: 'DESC' },
        });

        return {
            data: bids.map((b) => ({
                id: b.id,
                amount: Number(b.amount),
                bidder: b.bidder
                    ? { id: b.bidder.id, email: b.bidder.email, name: b.bidder.name }
                    : null,
                placedAt: b.placedAt,
            })),
            total: bids.length,
        };
    }
}
