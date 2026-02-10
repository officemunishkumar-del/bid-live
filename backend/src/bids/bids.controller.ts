import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BidsService } from './bids.service';
import { PlaceBidDto } from './bids.dto';

@Controller('auctions')
export class BidsController {
    constructor(private bidsService: BidsService) { }

    @Post(':id/bid')
    @UseGuards(JwtAuthGuard)
    async placeBid(
        @Param('id') auctionId: string,
        @Body() dto: PlaceBidDto,
        @Request() req,
    ) {
        return this.bidsService.placeBid(auctionId, req.user.id, dto.amount);
    }

    @Get(':id/bids')
    async getBidHistory(@Param('id') auctionId: string) {
        return this.bidsService.getBidHistory(auctionId);
    }
}
