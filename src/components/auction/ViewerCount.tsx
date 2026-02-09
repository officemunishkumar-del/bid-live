import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

interface ViewerCountProps {
    auctionId: string;
    className?: string;
}

const ViewerCount = ({ auctionId, className = "" }: ViewerCountProps) => {
    // Mock viewer count - simulates real-time updates
    const [count, setCount] = useState(() => Math.floor(Math.random() * 20) + 5);

    useEffect(() => {
        // Simulate viewers joining/leaving
        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const newCount = prev + change;
                return Math.max(1, Math.min(newCount, 50)); // Keep between 1-50
            });
        }, 5000 + Math.random() * 5000);

        return () => clearInterval(interval);
    }, [auctionId]);

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
