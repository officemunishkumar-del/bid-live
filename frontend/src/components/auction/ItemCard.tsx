import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { AuctionItem } from "@/types/auction";
import { formatCurrency } from "@/utils/formatters";
import SaveButton from "./SaveButton";
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
          <SaveButton className="absolute top-2 right-2 z-10" showLabel />
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='48' fill='%239ca3af'%3E🖼%3C/text%3E%3Ctext x='50%25' y='62%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";
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
