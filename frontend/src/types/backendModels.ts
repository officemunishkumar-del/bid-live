/**
 * Backend response models — typed to match the NestJS API responses.
 * Used in service layer to avoid `any`.
 */

export interface BackendUser {
    id: string;
    email: string;
    name: string;
    balance: number;
    hold: number;
    availableBalance: number;
    createdAt: string;
    wonAuctions: BackendAuction[];
    createdAuctions: BackendAuction[];
}

export interface BackendBid {
    id: string;
    amount: number;
    bidder: {
        id: string;
        email: string;
        name: string;
    };
    placedAt: string;
}

export interface BackendAuction {
    id: string;
    title: string;
    description: string;
    category?: string;
    images?: string[];
    startingPrice: number;
    currentPrice: number;
    endsAt: string;
    status: string;
    conditionReport?: string;
    shippingInfo?: string;
    creator?: {
        id: string;
        email: string;
        name?: string;
    };
    bids?: BackendBid[];
}

export interface BackendAuthResponse {
    user: BackendUser;
    accessToken: string;
}
