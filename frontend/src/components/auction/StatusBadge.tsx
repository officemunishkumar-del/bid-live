import { cn } from "@/lib/utils";

type AuctionStatus = "draft" | "active" | "sold" | "expired";

interface StatusBadgeProps {
    status: AuctionStatus;
    className?: string;
}

const statusConfig: Record<AuctionStatus, { label: string; className: string }> = {
    draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground",
    },
    active: {
        label: "Live",
        className: "bg-success/10 text-success border border-success/30",
    },
    sold: {
        label: "Sold",
        className: "bg-primary/10 text-primary border border-primary/30",
    },
    expired: {
        label: "Expired",
        className: "bg-muted text-muted-foreground",
    },
};

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
    const config = statusConfig[status] || statusConfig.active;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                config.className,
                className
            )}
        >
            {status === "active" && (
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
            )}
            {config.label}
        </span>
    );
};

export default StatusBadge;
