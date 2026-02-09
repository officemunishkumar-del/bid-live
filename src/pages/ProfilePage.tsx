import { Link } from "react-router-dom";
import { User as UserIcon, Wallet, Trophy, Gavel, Clock, ChevronRight, Settings, LogOut } from "lucide-react";
import { formatCurrency } from "@/data/mockData";
import ItemCard from "@/components/auction/ItemCard";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-serif font-bold mb-4">Please log in to view your profile</h1>
                <Link to="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    // Convert backend auctions to frontend format for ItemCard
    const formatAuctions = (auctions: any[] = []) => {
        return auctions.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: "Auction",
            images: item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
            estimateLow: item.startingPrice,
            estimateHigh: item.startingPrice * 2,
            currentBid: item.currentPrice || item.startingPrice,
            bidCount: 0,
            auctioneer: "You",
            auctioneerRating: 5.0,
            auctioneerReviews: 1,
            endTime: item.endsAt,
            lotNumber: `LOT-${item.id.slice(0, 8)}`,
            featured: false,
            currency: "$",
            conditionReport: "",
            shippingInfo: "",
            startingPrice: item.startingPrice,
        }));
    };

    const wonItems = formatAuctions(user.wonAuctions || []);
    const createdItems = formatAuctions(user.createdAuctions || []);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-10">
                {/* User Info Card */}
                <div className="flex-1 bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold text-center">
                            {user.name?.split(" ").map(n => n[0]).join("") || "U"}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-serif font-bold text-foreground">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </p>
                        </div>
                        <button className="h-9 px-4 rounded-md border border-input text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                            <Settings className="h-4 w-4" /> Settings
                        </button>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="md:w-80 bg-primary text-primary-foreground rounded-lg p-6 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Wallet className="h-5 w-5" />
                            <span className="text-sm font-medium opacity-80">Available Balance</span>
                        </div>
                        <p className="text-3xl font-bold mb-4">{formatCurrency(user.availableBalance || user.balance)}</p>
                        <div className="flex gap-2">
                            <button className="flex-1 h-9 rounded-md bg-primary-foreground text-primary text-sm font-semibold hover:opacity-90 transition-opacity">
                                Add Funds
                            </button>
                            <button className="flex-1 h-9 rounded-md bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                                Withdraw
                            </button>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { icon: Trophy, label: "Won Auctions", value: wonItems.length },
                    { icon: Gavel, label: "Your Auctions", value: createdItems.length },
                    { icon: Clock, label: "Watching", value: 0 },
                    { icon: UserIcon, label: "Following", value: 0 },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-card border border-border rounded-lg p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <span className="block text-2xl font-bold text-foreground">{value}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
                    </div>
                ))}
            </div>

            {/* Won Auctions */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-warning" /> Won Auctions
                    </h2>
                </div>
                {wonItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {wonItems.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary rounded-lg p-8 text-center border border-dashed border-border">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No auctions won yet</p>
                        <Link to="/search" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                            Start bidding →
                        </Link>
                    </div>
                )}
            </section>

            {/* Your Auctions */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-primary" /> Your Auctions
                    </h2>
                </div>
                {createdItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {createdItems.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary rounded-lg p-8 text-center border border-dashed border-border">
                        <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">You haven't created any auctions yet</p>
                        <Link to="/search" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                            List an item →
                        </Link>
                    </div>
                )}
            </section>

            {/* Account Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <span className="block font-medium text-foreground">Account Settings</span>
                            <span className="text-xs text-muted-foreground">Manage your personal information</span>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button
                    onClick={() => logout()}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="h-6 w-6 text-urgency" />
                        <div>
                            <span className="block font-medium text-urgency">Sign Out</span>
                            <span className="text-xs text-muted-foreground">End your current session</span>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
