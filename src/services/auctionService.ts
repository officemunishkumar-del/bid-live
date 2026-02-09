/**
 * Auction Service
 * Handles all auction-related API calls.
 * Currently uses mock data - replace with actual API calls when integrating.
 */

import { mockDelay } from "./api";
import { auctionItems, AuctionItem, formatCurrency } from "@/data/mockData";

export interface CreateAuctionData {
    title: string;
    description: string;
    category: string;
    startingPrice: number;
    duration: number; // hours
}

export interface PlaceBidData {
    auctionId: string;
    amount: number;
}

export interface Bid {
    id: string;
    amount: number;
    bidderId: string;
    bidderName: string;
    auctionItemId: string;
    createdAt: string;
}

export interface AuctionListParams {
    page?: number;
    limit?: number;
    status?: "draft" | "active" | "sold" | "expired";
    category?: string;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Get list of auctions with pagination
 */
export const getAuctions = async (
    params: AuctionListParams = {}
): Promise<PaginatedResponse<AuctionItem>> => {
    await mockDelay(500);

    const { page = 1, limit = 12, category, search } = params;

    let filtered = [...auctionItems];

    if (category) {
        filtered = filtered.filter(item => item.category === category);
    }

    if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Get auction by ID
 */
export const getAuctionById = async (id: string): Promise<AuctionItem | null> => {
    await mockDelay(300);

    const item = auctionItems.find(a => a.id === id);
    return item || null;
};

/**
 * Create a new auction
 */
export const createAuction = async (data: CreateAuctionData): Promise<AuctionItem> => {
    await mockDelay(1500);

    // Validation
    if (!data.title || !data.startingPrice || !data.category) {
        throw new Error("Missing required fields");
    }

    // Mock created auction
    const newAuction: AuctionItem = {
        id: `auction-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
        estimateLow: data.startingPrice,
        estimateHigh: data.startingPrice * 2,
        currentBid: 0,
        bidCount: 0,
        auctioneer: "Your Auction House",
        auctioneerRating: 5.0,
        auctioneerReviews: 0,
        endTime: new Date(Date.now() + data.duration * 60 * 60 * 1000).toISOString(),
        lotNumber: `LOT-${Math.floor(Math.random() * 10000)}`,
        featured: false,
        currency: "$",
        conditionReport: "New listing - condition to be verified",
        shippingInfo: "Shipping details will be provided by seller",
        startingPrice: data.startingPrice,
    };

    return newAuction;
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (data: PlaceBidData): Promise<{ success: boolean; message: string; bid?: Bid }> => {
    await mockDelay(1000);

    const auction = auctionItems.find(a => a.id === data.auctionId);

    if (!auction) {
        throw new Error("Auction not found");
    }

    // Check if bid is high enough
    if (data.amount <= auction.currentBid) {
        throw new Error(`Bid must be higher than current bid of ${formatCurrency(auction.currentBid, auction.currency)}`);
    }

    // 80% success rate for demo
    if (Math.random() > 0.2) {
        const bid: Bid = {
            id: `bid-${Date.now()}`,
            amount: data.amount,
            bidderId: "user-1",
            bidderName: "You",
            auctionItemId: data.auctionId,
            createdAt: new Date().toISOString(),
        };

        return {
            success: true,
            message: "Bid placed successfully!",
            bid,
        };
    } else {
        throw new Error("Someone placed a higher bid. Please try again.");
    }
};

/**
 * Get bid history for an auction
 */
export const getBidHistory = async (auctionId: string): Promise<Bid[]> => {
    await mockDelay(300);

    const names = ["John D.", "Sarah M.", "Mike R.", "Emma L.", "David K."];
    const bids: Bid[] = [];
    let baseAmount = 5000;

    for (let i = 0; i < 12; i++) {
        baseAmount += Math.floor(Math.random() * 500) + 100;
        bids.unshift({
            id: `bid-${auctionId}-${i}`,
            amount: baseAmount,
            bidderId: `user-${i}`,
            bidderName: names[Math.floor(Math.random() * names.length)],
            auctionItemId: auctionId,
            createdAt: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
        });
    }

    return bids;
};
