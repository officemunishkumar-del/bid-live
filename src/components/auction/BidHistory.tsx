import { formatCurrency } from "@/data/mockData";

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

// Mock bid history data
const generateMockBids = (auctionId: string, currency: string): Bid[] => {
    const names = ["John D.", "Sarah M.", "Mike R.", "Emma L.", "David K.", "Lisa P.", "Tom B.", "Anna C."];
    const bids: Bid[] = [];
    let baseAmount = 5000 + parseInt(auctionId) * 1000;

    for (let i = 0; i < 12; i++) {
        baseAmount += Math.floor(Math.random() * 500) + 100;
        bids.unshift({
            id: `bid-${auctionId}-${i}`,
            bidderName: names[Math.floor(Math.random() * names.length)],
            amount: baseAmount,
            currency,
            timestamp: new Date(Date.now() - i * 1000 * 60 * (Math.random() * 30 + 5)).toISOString(),
        });
    }

    return bids;
};

const BidHistory = ({ auctionId, currency = "$" }: BidHistoryProps) => {
    const bids = generateMockBids(auctionId, currency);

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
