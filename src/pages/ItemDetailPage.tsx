import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import { auctionItems, formatCurrency } from "@/data/mockData";
import CountdownTimer from "@/components/auction/CountdownTimer";
import SaveButton from "@/components/auction/SaveButton";
import ItemCard from "@/components/auction/ItemCard";
import BidHistory from "@/components/auction/BidHistory";
import ViewerCount from "@/components/auction/ViewerCount";
import StatusBadge from "@/components/auction/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const ItemDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const item = auctionItems.find((i) => i.id === id);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "shipping" | "condition" | "bids">("description");
  const [selectedBid, setSelectedBid] = useState(0);
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif">Item not found</h1>
        <Link to="/search" className="text-primary hover:underline text-sm mt-2 inline-block">Back to search</Link>
      </div>
    );
  }

  const bidOptions = [item.startingPrice, item.startingPrice + 200, item.startingPrice + 400];
  const currentItemIdx = auctionItems.findIndex((i) => i.id === id);
  const prevItem = auctionItems[currentItemIdx - 1];
  const nextItem = auctionItems[currentItemIdx + 1];
  const relatedItems = auctionItems.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 6);

  const tabs = [
    { key: "description" as const, label: "Description" },
    { key: "shipping" as const, label: "Shipping & Payment" },
    { key: "condition" as const, label: "Condition Report" },
    { key: "bids" as const, label: "Bid History" },
  ];

  const handlePlaceBid = async () => {
    setIsPlacingBid(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const bidAmount = bidOptions[selectedBid];

    // Mock success (80% chance) or failure (20% chance)
    if (Math.random() > 0.2) {
      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of ${formatCurrency(bidAmount, item.currency)} has been placed.`,
      });
    } else {
      toast({
        title: "Bid Failed",
        description: "Someone placed a higher bid. Please try again with a higher amount.",
        variant: "destructive",
      });
    }

    setIsPlacingBid(false);
  };

  return (
    <div>
      {/* Sub-header */}
      <div className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link to="/search" className="hover:text-foreground flex items-center gap-1"><ChevronLeft className="h-3 w-3" /> Back</Link>
            <span>|</span>
            <span>{item.category}</span>
            <StatusBadge status="active" />
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <ViewerCount auctionId={item.id} />
            <CountdownTimer endTime={item.endTime} showLabel={false} />
            <span>Lot: {item.lotNumber}</span>
            <div className="flex gap-1">
              {prevItem && <Link to={`/item/${prevItem.id}`} className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-muted"><ChevronLeft className="h-3 w-3" /></Link>}
              {nextItem && <Link to={`/item/${nextItem.id}`} className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-muted"><ChevronRight className="h-3 w-3" /></Link>}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery - 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex gap-3">
              {/* Thumbnails */}
              {item.images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-16 flex-shrink-0">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImgIdx(i)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${i === mainImgIdx ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main image */}
              <div className="relative flex-1 aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={item.images[mainImgIdx]} alt={item.title} className="w-full h-full object-contain" />
                {item.images.length > 1 && (
                  <>
                    <button onClick={() => setMainImgIdx((i) => (i - 1 + item.images.length) % item.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow hover:bg-background"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={() => setMainImgIdx((i) => (i + 1) % item.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow hover:bg-background"><ChevronRight className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bidding Widget */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-5 sticky top-28">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h1 className="text-lg font-serif font-bold text-foreground leading-snug">{item.title}</h1>
                </div>
                <SaveButton showLabel className="ml-2" />
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                Est. {formatCurrency(item.estimateLow, item.currency)}-{formatCurrency(item.estimateHigh, item.currency)}
              </p>
              <div className="mb-4">
                <CountdownTimer endTime={item.endTime} showLabel={false} className="text-sm" />
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Current Bid</span>
                  <Lock className="h-3 w-3 text-success" />
                  <span className="text-xs text-success font-medium">SECURE</span>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{formatCurrency(item.currentBid, item.currency)}</p>
                <p className="text-xs text-muted-foreground mb-4">{item.bidCount} bids</p>

                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Set Your Max Bid</p>
                <div className="flex gap-2 mb-3">
                  {bidOptions.map((amt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedBid(i)}
                      className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${selectedBid === i ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-muted"}`}
                    >
                      {formatCurrency(amt, item.currency)}
                    </button>
                  ))}
                </div>
                <select className="w-full h-9 px-3 mb-4 rounded-md border border-input bg-background text-sm">
                  <option>Or select a higher max bid amount</option>
                  {[600, 800, 1000, 1500, 2000].map((x) => (
                    <option key={x} value={item.startingPrice + x}>{formatCurrency(item.startingPrice + x, item.currency)}</option>
                  ))}
                </select>

                <button
                  onClick={handlePlaceBid}
                  disabled={isPlacingBid}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mb-3 disabled:opacity-50"
                >
                  {isPlacingBid ? "PLACING BID..." : "PLACE BID"}
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  Get approved to bid. <Link to="/profile" className="text-primary hover:underline">Register for Auction</Link>
                </p>
              </div>

              {/* Auctioneer info */}
              <div className="border-t border-border mt-5 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-serif font-bold text-muted-foreground">
                  {item.auctioneer.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.auctioneer}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span>{item.auctioneerRating} ({item.auctioneerReviews.toLocaleString()})</span>
                  </div>
                </div>
                <button className="text-xs text-primary font-medium hover:underline">Follow</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex gap-6 border-b border-border mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="max-w-3xl">
            {activeTab === "description" && <p className="text-sm text-foreground leading-relaxed">{item.description}</p>}
            {activeTab === "shipping" && <p className="text-sm text-foreground leading-relaxed">{item.shippingInfo}</p>}
            {activeTab === "condition" && <p className="text-sm text-foreground leading-relaxed">{item.conditionReport}</p>}
            {activeTab === "bids" && <BidHistory auctionId={item.id} currency={item.currency} />}
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">Related Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedItems.map((ri) => <ItemCard key={ri.id} item={ri} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailPage;

