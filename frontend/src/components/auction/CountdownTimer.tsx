import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/utils/formatters";

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  showLabel?: boolean;
}

const CountdownTimer = ({ endTime, className = "", showLabel = true }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const colorClass =
    timeLeft.urgency === "urgent" ? "text-urgency" :
      timeLeft.urgency === "warning" ? "text-warning" :
        timeLeft.urgency === "ended" ? "text-muted-foreground" :
          "text-success";

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {timeLeft.urgency === "ended"
        ? "Auction Ended"
        : timeLeft.label}
    </span>
  );
};

export default CountdownTimer;
