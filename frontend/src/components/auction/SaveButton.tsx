import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  className?: string;
  showLabel?: boolean;
}

const SaveButton = ({ className = "", showLabel = false }: SaveButtonProps) => {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        saved
          ? "bg-urgency text-urgency-foreground"
          : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-background",
        saved && "animate-heart-pulse",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
      {showLabel && <span>{saved ? "SAVED" : "SAVE"}</span>}
    </button>
  );
};

export default SaveButton;
