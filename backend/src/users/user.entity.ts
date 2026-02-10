import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Auction } from '../auctions/auction.entity';
import { Bid } from '../bids/bid.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: '' })
    name: string;

    @Column('decimal', { precision: 10, scale: 2, default: 1000 })
    balance: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    hold: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Auction, (auction) => auction.creator)
    createdAuctions: Auction[];

    @OneToMany(() => Auction, (auction) => auction.winner)
    wonAuctions: Auction[];

    @OneToMany(() => Bid, (bid) => bid.bidder)
    bids: Bid[];

    get availableBalance(): number {
        return Number(this.balance) - Number(this.hold);
    }
}
