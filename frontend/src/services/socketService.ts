/**
 * Socket Service
 * Handles WebSocket connections for real-time auction updates.
 * Uses Socket.IO client connected to the NestJS backend.
 */

import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

export type AuctionEventType =
    | "NEW_BID"
    | "AUCTION_ENDED"
    | "USER_JOINED"
    | "USER_LEFT"
    | "VIEWER_COUNT"
    | "BID_REJECTED"
    | "CONNECTION_STATE";

export interface NewBidEvent {
    auctionId: string;
    bid: {
        id: string;
        amount: number;
        bidder: { id: string; email: string; name: string };
        placedAt: string;
    };
    currentPrice: number;
    viewers: number;
}

export interface AuctionEndedEvent {
    auctionId: string;
    winner: { id: string; email: string; name: string } | null;
    finalPrice: number;
}

export interface UserJoinedEvent {
    auctionId: string;
    viewers: number;
}

export interface UserLeftEvent {
    auctionId: string;
    viewers: number;
}

export interface ConnectionStateEvent {
    connected: boolean;
    reconnecting: boolean;
    error?: string;
}

type EventCallback = (data: unknown) => void;

class SocketService {
    private socket: Socket | null = null;
    private eventListeners: Map<string, Set<EventCallback>> = new Map();
    private subscribedAuctions: Set<string> = new Set();
    private maxReconnectReached = false;

    /**
     * Connect to the WebSocket server.
     * Resolves when connected. Does NOT reject on connect_error —
     * instead lets Socket.IO's built-in reconnection handle transient failures.
     */
    connect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            const token = getToken();

            // Determine socket URL based on environment
            const socketUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000'
                : 'https://subvirile-anglea-unreprovable.ngrok-free.dev';

            this.maxReconnectReached = false;

            this.socket = io(socketUrl, {
                auth: { token },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 15000,
            });

            this.socket.on("connect", () => {
                console.log("[Socket] Connected");
                this.maxReconnectReached = false;
                this.emitLocal("CONNECTION_STATE", { connected: true, reconnecting: false });

                // Re-join rooms after reconnect
                this.subscribedAuctions.forEach((auctionId) => {
                    this.socket?.emit("join_auction", { auctionId });
                });

                resolve();
            });

            this.socket.on("disconnect", () => {
                console.log("[Socket] Disconnected");
                this.emitLocal("CONNECTION_STATE", { connected: false, reconnecting: false });
            });

            this.socket.on("connect_error", (error) => {
                console.error("[Socket] Connection error:", error.message);
                this.emitLocal("CONNECTION_STATE", {
                    connected: false,
                    reconnecting: true,
                    error: error.message,
                });
                // Don't reject — let reconnection logic handle it
            });

            // Fired when all reconnection attempts are exhausted
            this.socket.io.on("reconnect_failed", () => {
                console.error("[Socket] All reconnection attempts exhausted");
                this.maxReconnectReached = true;
                this.emitLocal("CONNECTION_STATE", {
                    connected: false,
                    reconnecting: false,
                    error: "Unable to connect. Please check your connection and try again.",
                });
            });

            // Listen for server events and forward to local listeners
            this.socket.on("NEW_BID", (data) => this.emitLocal("NEW_BID", data));
            this.socket.on("AUCTION_ENDED", (data) => this.emitLocal("AUCTION_ENDED", data));
            this.socket.on("USER_JOINED", (data) => {
                this.emitLocal("USER_JOINED", data);
                this.emitLocal("VIEWER_COUNT", data);
            });
            this.socket.on("USER_LEFT", (data) => {
                this.emitLocal("USER_LEFT", data);
                this.emitLocal("VIEWER_COUNT", data);
            });
            this.socket.on("BID_REJECTED", (data) => this.emitLocal("BID_REJECTED", data));
        });
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        this.subscribedAuctions.clear();
        this.socket?.disconnect();
        this.socket = null;
        this.maxReconnectReached = false;
        this.emitLocal("CONNECTION_STATE", { connected: false, reconnecting: false });
        console.log("[Socket] Disconnected");
    }

    /**
     * Manual reconnect — useful after max reconnection attempts exhausted
     */
    reconnect(): void {
        this.disconnect();
        this.connect().catch((err) =>
            console.error("[Socket] Manual reconnect failed:", err)
        );
    }

    /**
     * Check if reconnection attempts have been exhausted
     */
    isMaxReconnectReached(): boolean {
        return this.maxReconnectReached;
    }

    /**
     * Join an auction room
     */
    joinAuction(auctionId: string): void {
        this.subscribedAuctions.add(auctionId);
        if (this.socket?.connected) {
            this.socket.emit("join_auction", { auctionId });
        } else {
            // Auto-connect if not connected
            this.connect().catch((err) =>
                console.error("[Socket] Auto-connect failed:", err)
            );
        }
    }

    /**
     * Leave an auction room
     */
    leaveAuction(auctionId: string): void {
        this.subscribedAuctions.delete(auctionId);
        if (this.socket?.connected) {
            this.socket.emit("leave_auction", { auctionId });
        }
    }

    /**
     * Alias for joinAuction
     */
    subscribeToAuction(auctionId: string): void {
        this.joinAuction(auctionId);
    }

    /**
     * Alias for leaveAuction
     */
    unsubscribeFromAuction(auctionId: string): void {
        this.leaveAuction(auctionId);
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
     * Emit an event to local listeners
     */
    private emitLocal(event: string, data: unknown): void {
        this.eventListeners.get(event)?.forEach((callback) => callback(data));
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Check if reconnecting
     */
    isReconnecting(): boolean {
        return this.socket?.active === true && !this.socket?.connected;
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        this.disconnect();
    }
}

// Singleton instance
export const socketService = new SocketService();
