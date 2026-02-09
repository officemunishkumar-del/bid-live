/**
 * Socket Service
 * Handles WebSocket connections for real-time auction updates.
 * Currently simulates Socket.IO events - replace with actual Socket.IO when integrating.
 */

import { getToken } from "./api";

export type AuctionEventType =
    | "NEW_BID"
    | "AUCTION_ENDING_SOON"
    | "AUCTION_SOLD"
    | "AUCTION_EXPIRED"
    | "VIEWER_COUNT";

export interface NewBidEvent {
    auctionId: string;
    amount: number;
    bidderName: string;
    timestamp: string;
}

export interface AuctionEndingSoonEvent {
    auctionId: string;
    secondsRemaining: number;
}

export interface AuctionSoldEvent {
    auctionId: string;
    winnerName: string;
    finalPrice: number;
}

export interface AuctionExpiredEvent {
    auctionId: string;
}

export interface ViewerCountEvent {
    auctionId: string;
    count: number;
}

type EventCallback = (data: unknown) => void;

class SocketService {
    private connected: boolean = false;
    private subscribedAuctions: Set<string> = new Set();
    private eventListeners: Map<string, Set<EventCallback>> = new Map();
    private viewerCounts: Map<string, number> = new Map();
    private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Connect to the WebSocket server
     */
    connect(): Promise<void> {
        return new Promise((resolve) => {
            // Simulate connection delay
            setTimeout(() => {
                const token = getToken();
                if (token) {
                    console.log("[Socket] Connected with auth token");
                } else {
                    console.log("[Socket] Connected (unauthenticated)");
                }
                this.connected = true;
                resolve();
            }, 500);
        });
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        this.connected = false;
        this.subscribedAuctions.clear();
        this.simulationIntervals.forEach(interval => clearInterval(interval));
        this.simulationIntervals.clear();
        console.log("[Socket] Disconnected");
    }

    /**
     * Subscribe to an auction room
     */
    subscribeToAuction(auctionId: string): void {
        if (!this.connected) {
            console.warn("[Socket] Not connected, cannot subscribe");
            return;
        }

        if (this.subscribedAuctions.has(auctionId)) {
            return;
        }

        this.subscribedAuctions.add(auctionId);

        // Initialize viewer count
        const initialCount = Math.floor(Math.random() * 20) + 5;
        this.viewerCounts.set(auctionId, initialCount);

        // Emit initial viewer count
        this.emit("VIEWER_COUNT", { auctionId, count: initialCount });

        // Simulate viewer count updates
        const interval = setInterval(() => {
            const currentCount = this.viewerCounts.get(auctionId) || 0;
            const change = Math.random() > 0.5 ? 1 : -1;
            const newCount = Math.max(1, Math.min(currentCount + change, 50));
            this.viewerCounts.set(auctionId, newCount);
            this.emit("VIEWER_COUNT", { auctionId, count: newCount });
        }, 5000 + Math.random() * 5000);

        this.simulationIntervals.set(auctionId, interval);

        console.log(`[Socket] Subscribed to auction:${auctionId}`);
    }

    /**
     * Unsubscribe from an auction room
     */
    unsubscribeFromAuction(auctionId: string): void {
        this.subscribedAuctions.delete(auctionId);
        this.viewerCounts.delete(auctionId);

        const interval = this.simulationIntervals.get(auctionId);
        if (interval) {
            clearInterval(interval);
            this.simulationIntervals.delete(auctionId);
        }

        console.log(`[Socket] Unsubscribed from auction:${auctionId}`);
    }

    /**
     * Listen for events
     */
    on(event: AuctionEventType, callback: EventCallback): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
    }

    /**
     * Remove event listener
     */
    off(event: AuctionEventType, callback: EventCallback): void {
        this.eventListeners.get(event)?.delete(callback);
    }

    /**
     * Emit an event locally (for simulation)
     */
    private emit(event: AuctionEventType, data: unknown): void {
        this.eventListeners.get(event)?.forEach(callback => callback(data));
    }

    /**
     * Simulate a new bid event (for testing)
     */
    simulateNewBid(auctionId: string, amount: number): void {
        const names = ["John D.", "Sarah M.", "Mike R.", "Emma L."];
        const event: NewBidEvent = {
            auctionId,
            amount,
            bidderName: names[Math.floor(Math.random() * names.length)],
            timestamp: new Date().toISOString(),
        };
        this.emit("NEW_BID", event);
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connected;
    }
}

// Singleton instance
export const socketService = new SocketService();
