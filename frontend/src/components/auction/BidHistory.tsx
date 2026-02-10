import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/utils/formatters";
import { apiRequest } from "@/services/api";
import { socketService } from "@/services/socketService";

interface Bid {
    id: string;
    bidderName: string;
    amount: number;
    currency: string;
    timestamp: string;
}

interface BidHistoryProps {
    auctionId: string;
    currency?: string;
}

const BidHistory = ({ auctionId, currency = "$" }: BidHistoryProps) => {
    const [bids, setBids] = useState<Bid[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch bid history from API
    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await apiRequest<{ data: any[]; total: number }>(`/auctions/${auctionId}/bids`);
                const mapped: Bid[] = (response.data || []).map((b: any) => ({
                    id: b.id,
                    bidderName: b.bidder?.name || b.bidder?.email?.split("@")[0] || "Anonymous",
                    amount: Number(b.amount),
                    currency,
                    timestamp: b.placedAt,
                }));
                setBids(mapped);
            } catch (error) {
                console.error("[BidHistory] Failed to fetch bid history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBids();
    }, [auctionId, currency]);

    // Listen for NEW_BID events and prepend
    const handleNewBid = useCallback(
        (data: unknown) => {
            const event = data as {
                auctionId: string;
                bid: { id: string; amount: number; bidder: { id: string; email: string; name: string }; placedAt: string };
                currentPrice: number;
            };
            if (event.auctionId === auctionId && event.bid) {
                const newBid: Bid = {
                    id: event.bid.id,
                    bidderName: event.bid.bidder?.name || event.bid.bidder?.email?.split("@")[0] || "Anonymous",
                    amount: Number(event.bid.amount),
                    currency,
                    timestamp: event.bid.placedAt,
                };
                setBids((prev) => [newBid, ...prev]);
            }
        },
        [auctionId, currency]
    );

    useEffect(() => {
        socketService.on("NEW_BID", handleNewBid);
        return () => {
            socketService.off("NEW_BID", handleNewBid);
        };
    }, [handleNewBid]);

    if (isLoading) {
        return (
            <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Bid History</h3>
                </div>
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Loading bids...
                </div>
            </div>
        );
    }

    if (bids.length === 0) {
        return (
            <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Bid History (0 bids)</h3>
                </div>
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No bids yet. Be the first to bid!
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Bid History ({bids.length} bids)</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {bids.map((bid, index) => (
                    <div
                        key={bid.id}
                        className={`flex items-center justify-between px-4 py-2 ${index !== bids.length - 1 ? "border-b border-border" : ""} ${index === 0 ? "bg-primary/5" : ""}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {bid.bidderName.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {bid.bidderName}
                                    {index === 0 && <span className="ml-2 text-xs text-primary font-medium">HIGHEST</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(bid.timestamp).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                        <p className={`text-sm font-bold ${index === 0 ? "text-primary" : "text-foreground"}`}>
                            {formatCurrency(bid.amount, bid.currency)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BidHistory;
