import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { AuctionItem } from "@/types/auction";
import { formatCurrency } from "@/utils/formatters";
import CountdownTimer from "./CountdownTimer";

interface ItemCardProps {
  item: AuctionItem;
}

const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <Link to={`/item/${item.id}`} className="group block">
      <div className="hover-lift rounded-lg border border-border bg-card overflow-hidden">
        <div className="relative aspect-square overflow-hidden">
          {item.featured && (
            <span className="absolute top-2 left-2 z-10 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Featured
            </span>
          )}

          {/* Sold/Unsold Ribbon */}
          {new Date(item.endTime).getTime() <= Date.now() && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden text-[#f1f1f1]">
              <div className={`absolute bottom-0 left-0 w-[141%] h-8 flex items-center justify-center font-bold text-sm tracking-widest uppercase origin-bottom-left -rotate-45 translate-y-[20%] -translate-x-[20%] shadow-lg ${item.bidCount > 0 ? "bg-success" : "bg-urgency"}`}>
                {item.bidCount > 0 ? "SOLD" : "UNSOLD"}
              </div>
            </div>
          )}

          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const title = item.title || "Item";
              target.onerror = null;
              target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f9fafb' width='400' height='400'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='40' fill='%23d1d5db'%3E🖼%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='%239ca3af'%3E${encodeURIComponent(title)}%3C/text%3E%3C/svg%3E`;
            }}
          />

        </div>
        <div className="p-3 space-y-1.5">
          <CountdownTimer endTime={item.endTime} className="text-xs font-medium" showLabel={false} />
          <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 font-sans leading-tight">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{item.auctioneer}</span>
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span>{item.auctioneerRating}</span>
            <span>({item.auctioneerReviews.toLocaleString()})</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Est. {formatCurrency(item.estimateLow, item.currency)}-{formatCurrency(item.estimateHigh, item.currency)}
          </p>
          <p className="text-base font-bold text-card-foreground">
            {formatCurrency(item.currentBid, item.currency)}
            <span className="text-xs font-normal text-muted-foreground ml-1">({item.bidCount} bids)</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
