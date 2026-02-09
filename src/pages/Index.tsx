import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { auctionHouses, featuredAuctions, searchCategories, AuctionItem as UIAuctionItem } from "@/data/mockData";
import ItemCard from "@/components/auction/ItemCard";
import { getAuctions } from "@/services/auctionService";

const HomePage = () => {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [trendingItems, setTrendingItems] = useState<UIAuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const featured = featuredAuctions[carouselIdx];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await getAuctions();
        setTrendingItems(response.data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch trending auctions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[480px] bg-secondary overflow-hidden">
        <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10 py-10 md:py-0">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
              {featured.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 leading-tight">
              {featured.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              {featured.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/search" className="h-11 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-sm flex items-center hover:bg-primary/90 transition-colors">
                Bid Now
              </Link>
              <button className="h-11 px-8 rounded-md border border-input bg-background text-sm font-semibold hover:bg-muted transition-colors">
                Sell Your Item
              </button>
            </div>
          </div>
          <div className="md:w-1/2 relative h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl transition-all duration-700">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white uppercase tracking-wider text-xs font-bold flex justify-between">
                <span>Lot: {featured.lotNumber}</span>
                <span>Estimate: {featured.estimate}</span>
              </div>
            </div>

            <button
              onClick={() => setCarouselIdx((curr) => (curr - 1 + featuredAuctions.length) % featuredAuctions.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow flex items-center justify-center hover:bg-background transition-colors z-20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCarouselIdx((curr) => (curr + 1) % featuredAuctions.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow flex items-center justify-center hover:bg-background transition-colors z-20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <section className="py-12 border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex lg:grid lg:grid-cols-5 flex-nowrap overflow-x-auto gap-8 justify-between pb-4 lg:pb-0 scrollbar-hide">
            {searchCategories.slice(0, 5).map((category, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer min-w-[100px]">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl mb-3 group-hover:bg-primary/5 transition-all group-hover:scale-110">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auction Houses */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif font-bold text-foreground">Featured Auction Houses</h2>
            <Link to="/search" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctionHouses.map((house) => (
              <div key={house.id} className="group cursor-pointer">
                <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                  <img
                    src={house.image}
                    alt={house.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[10px] font-bold text-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-urgency rounded-full animate-pulse"></span> LIVE
                  </div>
                </div>
                <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">{house.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{house.location} • {house.upcomingCount} Upcoming</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Items */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-serif font-bold text-foreground mb-6">Trending Items</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Fetching latest treasures...</p>
            </div>
          ) : trendingItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No auctions found matching your search.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/search" className="inline-flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              View All Items <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-16 bg-secondary border-t border-border mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                🛡️
              </div>
              <h3 className="font-serif font-bold mb-2">Authenticated Items</h3>
              <p className="text-sm text-muted-foreground">Every listing is verified by our team of experts for authenticity and condition.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                💼
              </div>
              <h3 className="font-serif font-bold mb-2">Secure Transactions</h3>
              <p className="text-sm text-muted-foreground">We use industry-standard encryption to protect your financial information and bids.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                🚚
              </div>
              <h3 className="font-serif font-bold mb-2">Global Shipping</h3>
              <p className="text-sm text-muted-foreground">Safe and secure white-glove shipping to over 150 countries worldwide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
