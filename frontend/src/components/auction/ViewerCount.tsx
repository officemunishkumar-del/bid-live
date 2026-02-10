import { useState, useEffect, useCallback } from "react";
import { Eye } from "lucide-react";
import { socketService } from "@/services/socketService";

interface ViewerCountProps {
    auctionId: string;
    className?: string;
}

const ViewerCount = ({ auctionId, className = "" }: ViewerCountProps) => {
    const [count, setCount] = useState(1); // Start with 1 (yourself)

    const handleViewerUpdate = useCallback(
        (data: unknown) => {
            const event = data as { auctionId: string; viewers: number };
            if (event.auctionId === auctionId) {
                setCount(event.viewers);
            }
        },
        [auctionId]
    );

    useEffect(() => {
        socketService.on("VIEWER_COUNT", handleViewerUpdate);

        return () => {
            socketService.off("VIEWER_COUNT", handleViewerUpdate);
        };
    }, [handleViewerUpdate]);

    return (
        <div className={`flex items-center gap-1.5 text-muted-foreground ${className}`}>
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">
                {count} watching
            </span>
        </div>
    );
};

export default ViewerCount;
