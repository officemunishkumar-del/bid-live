import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { id } });
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }

    async getProfile(id: string): Promise<User | null> {
        return this.usersRepo.findOne({
            where: { id },
            relations: ['createdAuctions', 'wonAuctions'],
        });
    }

    async updateBalance(id: string, amount: number): Promise<void> {
        await this.usersRepo
            .createQueryBuilder()
            .update(User)
            .set({ balance: () => `balance + ${amount}` })
            .where('id = :id', { id })
            .execute();
    }
}
