import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction, AuctionStatus } from './auction.entity';
import { CreateAuctionDto } from './auctions.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class AuctionsService {
    constructor(
        @InjectRepository(Auction)
        private auctionsRepo: Repository<Auction>,
        @Inject(forwardRef(() => JobsService))
        private jobsService: JobsService,
    ) { }

    async create(dto: CreateAuctionDto, creatorId: string): Promise<Auction> {
        const auction = this.auctionsRepo.create({
            title: dto.title,
            description: dto.description || '',
            startingPrice: dto.startingPrice,
            currentPrice: dto.startingPrice,
            endsAt: new Date(dto.endsAt),
            creatorId,
            status: AuctionStatus.ACTIVE,
        });
        const saved = await this.auctionsRepo.save(auction);

        // Schedule settlement job
        await this.jobsService.scheduleSettlement(saved.id, saved.endsAt);

        return saved;
    }

    async findAll(
        page: number = 1,
        limit: number = 20,
        status?: string,
    ): Promise<{ data: Auction[]; total: number; page: number; lastPage: number }> {
        // Ensure page and limit are numbers (query params may arrive as strings)
        const p = Number(page) || 1;
        const l = Number(limit) || 20;

        const queryBuilder = this.auctionsRepo
            .createQueryBuilder('auction')
            .leftJoinAndSelect('auction.creator', 'creator')
            .leftJoinAndSelect('auction.winner', 'winner')
            .leftJoinAndSelect('auction.bids', 'bids')
            .orderBy('auction.createdAt', 'DESC');

        if (status) {
            queryBuilder.where('auction.status = :status', {
                status: status.toUpperCase(),
            });
        }

        const total = await queryBuilder.getCount();
        const lastPage = Math.ceil(total / l);

        const data = await queryBuilder
            .skip((p - 1) * l)
            .take(l)
            .getMany();

        return { data, total, page: p, lastPage };
    }

    async findOne(id: string): Promise<Auction> {
        const auction = await this.auctionsRepo.findOne({
            where: { id },
            relations: ['creator', 'winner', 'bids', 'bids.bidder'],
        });

        if (!auction) {
            throw new NotFoundException('Auction not found');
        }

        return auction;
    }

    async updateStatus(id: string, status: AuctionStatus): Promise<void> {
        await this.auctionsRepo.update(id, { status });
    }
}
