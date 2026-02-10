import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './auction.entity';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction]),
        forwardRef(() => JobsModule),
    ],
    controllers: [AuctionsController],
    providers: [AuctionsService],
    exports: [AuctionsService],
})
export class AuctionsModule { }
