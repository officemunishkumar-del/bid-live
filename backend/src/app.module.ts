import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { SocketModule } from './socket/socket.module';
import { JobsModule } from './jobs/jobs.module';
import { User } from './users/user.entity';
import { Auction } from './auctions/auction.entity';
import { Bid } from './bids/bid.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'livebid',
            entities: [User, Auction, Bid],
            synchronize: true, // Dev only — use migrations in production
            logging: process.env.NODE_ENV === 'development',
        }),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),
        AuthModule,
        UsersModule,
        AuctionsModule,
        BidsModule,
        SocketModule,
        JobsModule,
    ],
})
export class AppModule { }
