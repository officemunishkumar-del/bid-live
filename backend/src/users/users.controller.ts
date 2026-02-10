import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        const user = await this.usersService.getProfile(req.user.id);
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            balance: Number(user.balance),
            hold: Number(user.hold),
            availableBalance: Number(user.balance) - Number(user.hold),
            createdAt: user.createdAt,
            wonAuctions: user.wonAuctions || [],
            createdAuctions: user.createdAuctions || [],
        };
    }
}
