import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuctionGateway } from './auction.gateway';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'livebid-secret-key-change-in-production',
        }),
    ],
    providers: [AuctionGateway],
    exports: [AuctionGateway],
})
export class SocketModule { }
