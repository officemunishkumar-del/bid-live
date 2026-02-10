export interface AuctionItem {
    id: string;
    title: string;
    category: string;
    images: string[];
    estimateLow: number;
    estimateHigh: number;
    currentBid: number;
    bidCount: number;
    auctioneer: string;
    auctioneerRating: number;
    auctioneerReviews: number;
    endTime: string;
    lotNumber: string;
    featured: boolean;
    currency: string;
    description: string;
    conditionReport: string;
    shippingInfo: string;
    startingPrice: number;
    status?: "active" | "sold" | "expired";
}

export interface AuctionHouse {
    id: string;
    name: string;
    logo: string;
    image?: string;
    upcomingCount?: number;
    location: string;
    rating: number;
    reviewCount: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    lastPage: number;
}

export interface FeaturedAuction {
    id: string;
    title: string;
    category?: string;
    description?: string;
    auctioneer: string;
    date: string;
    image?: string;
    images: string[];
    lotCount: number;
    lotNumber?: string;
    estimate?: string;
    location: string;
}

export interface SearchCategory {
    id: string;
    name: string;
    icon: string;
    itemCount: number;
    followerCount: number;
    images: string[];
}
