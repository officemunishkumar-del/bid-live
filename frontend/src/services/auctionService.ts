/**
 * Auction Service
 * Handles auction data fetching and real-time bidding.
 * Connected to the NestJS backend API.
 */

import { apiRequest } from "./api";
import { AuctionItem as UIAuctionItem, PaginatedResponse } from "@/types/auction";
import { BackendAuction } from "@/types/backendModels";
import { CreateAuctionDto } from "@/types/createAuctionDto";

/**
 * Fetch all auctions with pagination and status filter
 */
export const getAuctions = async (page: number = 1, limit: number = 20, status?: string): Promise<PaginatedResponse<UIAuctionItem>> => {
    let url = `/auctions?page=${page}&limit=${limit}`;
    if (status) {
        url += `&status=${status}`;
    }

    const response = await apiRequest<PaginatedResponse<BackendAuction>>(url);

    // Map backend model to UI model
    return {
        ...response,
        data: response.data.map(mapBackendToUI)
    };
};

/**
 * Fetch a single auction by ID
 */
export const getAuctionById = async (id: string): Promise<UIAuctionItem> => {
    const response = await apiRequest<BackendAuction>(`/auctions/${id}`);
    return mapBackendToUI(response);
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (params: { auctionId: string; amount: number }): Promise<{ success: boolean; message: string }> => {
    await apiRequest(`/auctions/${params.auctionId}/bid`, {
        method: "POST",
        body: JSON.stringify({ amount: params.amount }),
    });

    return {
        success: true,
        message: "Bid placed successfully",
    };
};

/**
 * Create a new auction
 */
export const createAuction = async (data: CreateAuctionDto): Promise<UIAuctionItem> => {
    const response = await apiRequest<BackendAuction>("/auctions", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return mapBackendToUI(response);
};

/**
 * Map backend status (ACTIVE, ENDED, SETTLED) to frontend status (active, expired, sold)
 */
const mapStatus = (backendStatus?: string): "active" | "sold" | "expired" => {
    switch (backendStatus?.toUpperCase()) {
        case "SETTLED": return "sold";
        case "ENDED": return "expired";
        case "ACTIVE":
        default: return "active";
    }
};

/**
 * Helper to map backend auction entity to UI model.
 * Uses optional chaining to guard against null/undefined fields.
 */
const mapBackendToUI = (item: BackendAuction): UIAuctionItem => {
    const creatorName = item.creator?.name ?? item.creator?.email?.split("@")[0] ?? "Unknown";

    return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category || "General",
        images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
        estimateLow: item.startingPrice,
        estimateHigh: item.startingPrice * 2,
        currentBid: item.currentPrice || item.startingPrice,
        bidCount: item.bids ? item.bids.length : 0,
        auctioneer: creatorName,
        auctioneerRating: 4.5,
        auctioneerReviews: 120,
        endTime: item.endsAt,
        lotNumber: `LOT-${item.id.slice(0, 8)}`,
        featured: false,
        currency: "$",
        conditionReport: item.conditionReport || "No condition report available.",
        shippingInfo: item.shippingInfo || "Contact auctioneer for shipping details.",
        startingPrice: item.startingPrice,
        status: mapStatus(item.status),
    };
};
