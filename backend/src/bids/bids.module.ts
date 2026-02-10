import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './bid.entity';
import { Auction } from '../auctions/auction.entity';
import { User } from '../users/user.entity';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Bid, Auction, User]),
        forwardRef(() => SocketModule),
    ],
    controllers: [BidsController],
    providers: [BidsService],
    exports: [BidsService],
})
export class BidsModule { }
