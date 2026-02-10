import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { auctionItems, categories } from "@/data/mockData";
import ItemCard from "@/components/auction/ItemCard";

const ITEMS_PER_PAGE = 12;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [keyword, setKeyword] = useState(queryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);

  // Simple mock filtering
  const filtered = auctionItems.filter((item) => {
    const matchesKeyword = !keyword || item.title.toLowerCase().includes(keyword.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.currentBid - b.currentBid;
    if (sortBy === "price-high") return b.currentBid - a.currentBid;
    if (sortBy === "ending") return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    return 0;
  });

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
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="h-9 px-4 rounded-md border border-input bg-background text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" /> All Filters
        </button>

        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>

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

      <div className="flex gap-6">
        {/* Filter Sidebar (drawer) */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0 border border-border rounded-lg p-4 h-fit sticky top-28 animate-fade-in hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm font-sans">All Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Item Location</h4>
                {["United States", "Europe", "Asia", "Other"].map((loc) => (
                  <label key={loc} className="flex items-center gap-2 py-1 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="rounded border-input" /> {loc}
                  </label>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input placeholder="Min" className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background" />
                  <input placeholder="Max" className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Auction Type</h4>
                {["Live Auction", "Timed Auction"].map((t) => (
                  <label key={t} className="flex items-center gap-2 py-1 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="rounded border-input" /> {t}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 h-8 rounded-md bg-primary text-primary-foreground text-xs font-semibold">Apply</button>
                <button className="flex-1 h-8 rounded-md border border-input text-xs font-semibold">Reset</button>
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">{sorted.length} results{keyword && ` for "${keyword}"`}{selectedCategory && ` in ${selectedCategory}`}</p>
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
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
