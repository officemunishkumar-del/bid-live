import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Bid } from '../bids/bid.entity';

export enum AuctionStatus {
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
    SETTLED = 'SETTLED',
}

@Entity('auctions')
export class Auction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    startingPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    currentPrice: number;

    @Column({ type: 'timestamp' })
    endsAt: Date;

    @Column({
        type: 'enum',
        enum: AuctionStatus,
        default: AuctionStatus.ACTIVE,
    })
    status: AuctionStatus;

    @Column({ nullable: true })
    creatorId: string;

    @Column({ nullable: true })
    winnerId: string;

    @VersionColumn()
    version: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.createdAuctions, { eager: true })
    @JoinColumn({ name: 'creatorId' })
    creator: User;

    @ManyToOne(() => User, (user) => user.wonAuctions, { nullable: true })
    @JoinColumn({ name: 'winnerId' })
    winner: User;

    @OneToMany(() => Bid, (bid) => bid.auction)
    bids: Bid[];
}
