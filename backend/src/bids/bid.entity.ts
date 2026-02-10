import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Auction } from '../auctions/auction.entity';
import { User } from '../users/user.entity';

@Entity('bids')
export class Bid {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    auctionId: string;

    @Column()
    bidderId: string;

    @CreateDateColumn()
    placedAt: Date;

    @ManyToOne(() => Auction, (auction) => auction.bids)
    @JoinColumn({ name: 'auctionId' })
    auction: Auction;

    @ManyToOne(() => User, (user) => user.bids, { eager: true })
    @JoinColumn({ name: 'bidderId' })
    bidder: User;
}
