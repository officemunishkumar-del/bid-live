import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Lock, Star, Wifi, WifiOff, Loader2, Search, Home, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency, getTimeRemaining } from "@/utils/formatters";
import CountdownTimer from "@/components/auction/CountdownTimer";
import BidHistory from "@/components/auction/BidHistory";
import ViewerCount from "@/components/auction/ViewerCount";
import StatusBadge from "@/components/auction/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { socketService, ConnectionStateEvent } from "@/services/socketService";
import { getAuctionById, placeBid } from "@/services/auctionService";

const MIN_BID_INCREMENT = 100;

const ItemDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "bids">("description");
  const [selectedBid, setSelectedBid] = useState<number | null>(0);
  const [customBidAmount, setCustomBidAmount] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState<"active" | "expired" | "sold">("active");

  // Fetch auction data via React Query
  const { data: item, isLoading, error } = useQuery({
    queryKey: ["auction", id],
    queryFn: () => getAuctionById(id!),
    enabled: !!id,
    staleTime: 15_000,
  });

  // Set initial state when item loads
  useEffect(() => {
    if (item) {
      setCurrentBid(item.currentBid);
      const timeDetails = getTimeRemaining(item.endTime);
      if (timeDetails.total <= 0) {
        setAuctionStatus(item.status === "sold" ? "sold" : "expired");
      } else {
        setAuctionStatus(item.status || "active");
      }
    }
  }, [item]);

  // Bid mutation with cache invalidation and balance refresh
  const bidMutation = useMutation({
    mutationFn: (amount: number) =>
      placeBid({ auctionId: item!.id, amount }),
    onSuccess: async (_result, amount) => {
      setCurrentBid(amount);
      // Invalidate auction cache so next visit gets fresh data
      queryClient.invalidateQueries({ queryKey: ["auction", id] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      // Refresh user balance
      await refreshUser();
      toast({
        title: "Bid Successful!",
        description: `Your bid of ${formatCurrency(amount)} has been placed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bid Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Check auction status periodically
  useEffect(() => {
    if (!item) return;

    const interval = setInterval(() => {
      const timeRemaining = getTimeRemaining(item.endTime);
      if (timeRemaining.total <= 0 && auctionStatus === "active") {
        setAuctionStatus("expired");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [item, auctionStatus]);

  // Socket connection listener
  useEffect(() => {
    const handleConnectionState = (data: unknown) => {
      const state = data as ConnectionStateEvent;
      setIsOnline(state.connected);
      setIsReconnecting(state.reconnecting);

      if (state.connected && !state.reconnecting && id) {
        socketService.joinAuction(id);
      }
    };

    socketService.on("CONNECTION_STATE", handleConnectionState);
    if (id) socketService.joinAuction(id);

    return () => {
      socketService.off("CONNECTION_STATE", handleConnectionState);
      if (id) socketService.leaveAuction(id);
    };
  }, [id]);

  // Update current bid from socket events
  useEffect(() => {
    if (!id) return;

    const handleNewBid = (data: unknown) => {
      const event = data as {
        auctionId: string;
        bid: { id: string; amount: number; bidder: { id: string; email: string; name: string }; placedAt: string };
        currentPrice: number;
        viewers: number;
      };
      if (event.auctionId === id) {
        setCurrentBid(event.currentPrice);
        toast({
          title: "New Bid!",
          description: `${event.bid?.bidder?.name || "Someone"} placed a bid of ${formatCurrency(event.currentPrice)}`,
        });
      }
    };

    const handleAuctionEnded = (data: unknown) => {
      const event = data as {
        auctionId: string;
        winner: { id: string; email: string; name: string } | null;
        finalPrice: number;
      };
      if (event.auctionId === id) {
        if (event.winner) {
          setAuctionStatus("sold");
          toast({
            title: "Auction Sold!",
            description: `Won by ${event.winner.name || event.winner.email} for ${formatCurrency(event.finalPrice)}`,
          });
        } else {
          setAuctionStatus("expired");
          toast({
            title: "Auction Ended",
            description: "This auction ended with no bids.",
          });
        }
      }
    };

    socketService.on("NEW_BID", handleNewBid);
    socketService.on("AUCTION_ENDED", handleAuctionEnded);

    return () => {
      socketService.off("NEW_BID", handleNewBid);
      socketService.off("AUCTION_ENDED", handleAuctionEnded);
    };
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading masterpiece details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-serif font-bold mb-2 text-foreground">
          {error ? "Failed to Load" : "Item Not Found"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : "This auction may have been removed or the link may be incorrect."}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="h-10 px-5 rounded-md bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link to="/search" className="h-10 px-5 rounded-md border border-input text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-colors">
            <Search className="h-4 w-4" /> Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  const minNextBid = currentBid + MIN_BID_INCREMENT;
  const bidOptions = [minNextBid, minNextBid + 200, minNextBid + 400];

  // Determine the active bid amount: custom input takes priority when filled
  const parsedCustom = customBidAmount ? parseFloat(customBidAmount) : 0;
  const isCustomMode = customBidAmount !== "" && parsedCustom > 0;
  const selectedBidAmount = isCustomMode
    ? parsedCustom
    : selectedBid !== null
      ? bidOptions[selectedBid]
      : minNextBid;

  const isCustomTooLow = isCustomMode && parsedCustom < minNextBid;
  const isCustomNotNumber = customBidAmount !== "" && (isNaN(parsedCustom) || parsedCustom <= 0);
  const userBalance = user?.balance || 0;
  const hasInsufficientBalance = isAuthenticated && userBalance < selectedBidAmount;

  const isBiddingDisabled =
    bidMutation.isPending ||
    !isOnline ||
    auctionStatus !== "active" ||
    hasInsufficientBalance ||
    isCustomTooLow ||
    isCustomNotNumber ||
    !isAuthenticated;

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to place a bid.",
        variant: "destructive",
      });
      return;
    }

    // Refresh balance before placing bid to get latest state
    await refreshUser();
    const latestBalance = user?.balance || 0;
    if (latestBalance < selectedBidAmount) {
      toast({
        title: "Insufficient Funds",
        description: `Your current balance is ${formatCurrency(latestBalance)}. You need at least ${formatCurrency(selectedBidAmount)} to place this bid.`,
        variant: "destructive",
      });
      return;
    }

    bidMutation.mutate(selectedBidAmount);
  };

  const getButtonText = () => {
    if (bidMutation.isPending) return "PLACING BID...";
    if (!isAuthenticated) return "LOGIN TO BID";
    if (!isOnline) return "OFFLINE";
    if (auctionStatus === "expired") return "AUCTION ENDED";
    if (auctionStatus === "sold") return "SOLD";
    if (hasInsufficientBalance) return "INSUFFICIENT FUNDS";
    return "PLACE BID";
  };

  return (
    <div>
      {/* Network Status Banner */}
      {(!isOnline || isReconnecting) && (
        <div className={`py-2 px-4 text-center text-sm ${isReconnecting ? "bg-warning/20 text-warning" : "bg-urgency/20 text-urgency"}`}>
          <div className="container mx-auto flex items-center justify-center gap-2">
            {isReconnecting ? (
              <><Wifi className="h-4 w-4 animate-pulse" /><span>Reconnecting...</span></>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>You are offline.</span>
                {socketService.isMaxReconnectReached() && (
                  <button
                    onClick={() => socketService.reconnect()}
                    className="underline font-medium ml-1 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Sub-header - Sticky below main Header */}
      <div className="sticky top-16 z-40 border-b border-border bg-secondary shadow-sm">
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link to="/search" className="hover:text-foreground flex items-center gap-1"><ChevronLeft className="h-3 w-3" /> Back</Link>
            <span>|</span>
            <span>{item.category}</span>
            <StatusBadge status={auctionStatus} />
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <ViewerCount auctionId={item.id} />
            <CountdownTimer endTime={item.endTime} showLabel={false} />
            <span>Lot: {item.lotNumber}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-3">
              <div className="relative flex-1 aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.images[mainImgIdx]}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const title = item.title || "Item";
                    target.onerror = null;
                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect fill='%23f9fafb' width='600' height='600'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='64' fill='%23d1d5db'%3E🖼%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' font-weight='600' fill='%239ca3af'%3E${encodeURIComponent(title)}%3C/text%3E%3C/svg%3E`;
                  }}
                />

              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-5 sticky top-[110px]">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-lg font-serif font-bold text-foreground leading-snug">{item.title}</h1>

              </div>

              <p className="text-sm text-muted-foreground mb-1">
                Est. {formatCurrency(item.estimateLow)}-{formatCurrency(item.estimateHigh)}
              </p>

              {isAuthenticated && (
                <div className="bg-secondary rounded-md p-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className={`font-semibold ${hasInsufficientBalance ? "text-urgency" : "text-foreground"}`}>
                      {formatCurrency(userBalance)}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Current Bid</span>
                  <Lock className="h-3 w-3 text-success" />
                  <span className="text-xs text-success font-medium">SECURE</span>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{formatCurrency(currentBid)}</p>
                <p className="text-xs text-muted-foreground mb-4">Min next bid: {formatCurrency(minNextBid)}</p>

                {auctionStatus === "active" ? (
                  <>
                    <div className="flex gap-2 mb-3">
                      {bidOptions.map((amt, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedBid(i); setCustomBidAmount(""); }}
                          className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${selectedBid === i && !isCustomMode ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-muted"}`}
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>

                    {/* Custom bid amount input */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <input
                            type="number"
                            placeholder={`Enter amount (min ${formatCurrency(minNextBid)})`}
                            value={customBidAmount}
                            onChange={(e) => { setCustomBidAmount(e.target.value); setSelectedBid(null); }}
                            min={minNextBid}
                            step={1}
                            className={`w-full h-9 rounded-md border pl-7 pr-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${isCustomMode ? "border-primary bg-primary/5 text-primary" : "border-input"} ${isCustomTooLow || isCustomNotNumber ? "border-urgency text-urgency" : ""}`}
                          />
                        </div>
                      </div>
                      {isCustomTooLow && (
                        <p className="text-xs text-urgency mt-1">Minimum bid is {formatCurrency(minNextBid)}</p>
                      )}
                      {isCustomNotNumber && !isCustomTooLow && (
                        <p className="text-xs text-urgency mt-1">Please enter a valid positive number</p>
                      )}
                    </div>

                    <button
                      onClick={handlePlaceBid}
                      disabled={isBiddingDisabled}
                      className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {bidMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {getButtonText()}
                    </button>
                  </>
                ) : (
                  <div className="bg-muted rounded-md p-4 text-center">
                    <p className="text-sm font-medium">{auctionStatus === "sold" ? "Sold" : "Ended"}</p>
                    <Link to="/search" className="text-primary text-sm hover:underline mt-2 inline-block">Browse others</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="flex gap-6 border-b border-border mb-6">
            {(["description", "bids"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="max-w-3xl">
            {activeTab === "description" ? (
              <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
            ) : (
              <BidHistory auctionId={item.id} currency="$" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
