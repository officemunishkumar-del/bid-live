import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuctions } from "@/services/auctionService";
import ItemCard from "@/components/auction/ItemCard";

const ITEMS_PER_PAGE = 12;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [keyword, setKeyword] = useState(queryParam);
  const [debouncedKeyword, setDebouncedKeyword] = useState(queryParam);
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);

  // Debounce keyword input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Fetch auctions via React Query — cached and auto-retried
  const { data: allItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ["auctions", "search"],
    queryFn: async () => {
      const response = await getAuctions(1, 100);
      return response.data;
    },
    staleTime: 30_000, // 30s cache
  });

  // Client-side filtering (memoised, uses debounced keyword)
  const filtered = useMemo(() => allItems.filter((item) => {
    const matchesKeyword = !debouncedKeyword || item.title.toLowerCase().includes(debouncedKeyword.toLowerCase());
    return matchesKeyword;
  }), [allItems, debouncedKeyword]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.currentBid - b.currentBid;
    if (sortBy === "price-high") return b.currentBid - a.currentBid;
    if (sortBy === "ending") return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    return 0;
  }), [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            placeholder="Filter by keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="relevant">Most Relevant</option>
            <option value="ending">Ending Soon</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-urgency/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg font-serif font-semibold text-foreground mb-1">Failed to load auctions</p>
            <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : "Unknown error"}</p>
            <button
              onClick={() => refetch()}
              className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{sorted.length} results{keyword && ` for "${keyword}"`}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
            {paged.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-serif">No items found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 w-9 rounded-md border border-input flex items-center justify-center disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-md text-sm font-medium ${p === page ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"}`}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9 w-9 rounded-md border border-input flex items-center justify-center disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
