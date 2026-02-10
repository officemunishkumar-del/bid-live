import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateAuctionDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(1)
    startingPrice: number;

    @IsDateString()
    endsAt: string;
}
