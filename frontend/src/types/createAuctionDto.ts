/**
 * DTO for creating a new auction.
 * Used to enforce type safety on the CreateAuctionPage form submission.
 */

export interface CreateAuctionDto {
    title: string;
    description: string;
    category?: string;
    startingPrice: number;
    endsAt: string; // ISO 8601 date string
    images?: string[];
}
