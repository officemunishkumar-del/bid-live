import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { SettlementWorker } from './settlement.worker';
import { Auction } from '../auctions/auction.entity';
import { Bid } from '../bids/bid.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'auction-settlement',
        }),
        TypeOrmModule.forFeature([Auction, Bid]),
        SocketModule,
    ],
    providers: [JobsService, SettlementWorker],
    exports: [JobsService],
})
export class JobsModule { }
