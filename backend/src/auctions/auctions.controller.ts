import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './auctions.dto';

@Controller('auctions')
export class AuctionsController {
    constructor(private auctionsService: AuctionsService) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('status') status?: string,
    ) {
        return this.auctionsService.findAll(page, limit, status);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const auction = await this.auctionsService.findOne(id);
        return {
            ...auction,
            startingPrice: Number(auction.startingPrice),
            currentPrice: Number(auction.currentPrice),
            creator: auction.creator
                ? {
                    id: auction.creator.id,
                    email: auction.creator.email,
                    name: auction.creator.name,
                }
                : null,
            winner: auction.winner
                ? {
                    id: auction.winner.id,
                    email: auction.winner.email,
                    name: auction.winner.name,
                }
                : null,
            bids: (auction.bids || []).map((b) => ({
                id: b.id,
                amount: Number(b.amount),
                bidder: b.bidder
                    ? { id: b.bidder.id, email: b.bidder.email, name: b.bidder.name }
                    : null,
                placedAt: b.placedAt,
            })),
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateAuctionDto, @Request() req) {
        const auction = await this.auctionsService.create(dto, req.user.id);
        return auction;
    }
}
