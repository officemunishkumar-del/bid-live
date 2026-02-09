import { Link } from "react-router-dom";
import { User, Wallet, Trophy, Gavel, Clock, ChevronRight, Settings, LogOut } from "lucide-react";
import { auctionItems, formatCurrency } from "@/data/mockData";
import ItemCard from "@/components/auction/ItemCard";

// Mock user data - will be replaced with real API data
const mockUser = {
    id: "user-1",
    email: "john.doe@example.com",
    name: "John Doe",
    balance: 15750.00,
    createdAt: "2024-01-15",
};

// Mock won auctions
const wonAuctions = auctionItems.slice(0, 2).map(item => ({
    ...item,
    status: "sold" as const,
    wonAt: "2026-02-05",
    finalPrice: item.currentBid,
}));

// Mock active bids
const activeBids = auctionItems.slice(3, 6).map(item => ({
    ...item,
    myBid: item.currentBid - 500,
    isWinning: false,
}));

const ProfilePage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-10">
                {/* User Info Card */}
                <div className="flex-1 bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold">
                            {mockUser.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-serif font-bold text-foreground">{mockUser.name}</h1>
                            <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">Member since {new Date(mockUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                        </div>
                        <button className="h-9 px-4 rounded-md border border-input text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                            <Settings className="h-4 w-4" /> Settings
                        </button>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="w-full md:w-80 bg-primary text-primary-foreground rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-80">Available Balance</span>
                    </div>
                    <p className="text-3xl font-bold mb-4">{formatCurrency(mockUser.balance)}</p>
                    <div className="flex gap-2">
                        <button className="flex-1 h-9 rounded-md bg-primary-foreground text-primary text-sm font-semibold hover:opacity-90 transition-opacity">
                            Add Funds
                        </button>
                        <button className="flex-1 h-9 rounded-md border border-primary-foreground/30 text-sm font-medium hover:bg-primary-foreground/10 transition-colors">
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { icon: Trophy, label: "Won Auctions", value: wonAuctions.length },
                    { icon: Gavel, label: "Active Bids", value: activeBids.length },
                    { icon: Clock, label: "Watching", value: 12 },
                    { icon: User, label: "Following", value: 5 },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-card border border-border rounded-lg p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>

            {/* Won Auctions */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-warning" /> Won Auctions
                    </h2>
                    <Link to="/search" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                {wonAuctions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {wonAuctions.map(item => (
                            <div key={item.id} className="relative">
                                <div className="absolute top-2 left-2 z-10 bg-success text-white px-2 py-0.5 rounded text-xs font-medium">
                                    WON
                                </div>
                                <ItemCard item={item} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary rounded-lg p-8 text-center">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No auctions won yet</p>
                        <Link to="/search" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                            Start bidding →
                        </Link>
                    </div>
                )}
            </section>

            {/* Active Bids */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-primary" /> Active Bids
                    </h2>
                    <Link to="/search" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                {activeBids.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeBids.map(item => (
                            <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                                <img src={item.images[0]} alt={item.title} className="w-20 h-20 rounded-md object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.auctioneer}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Your bid:</span>
                                        <span className="text-sm font-bold text-foreground">{formatCurrency(item.myBid, item.currency)}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Current:</span>
                                        <span className="text-sm font-bold text-urgency">{formatCurrency(item.currentBid, item.currency)}</span>
                                        <span className="text-xs text-urgency font-medium">OUTBID</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary rounded-lg p-8 text-center">
                        <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No active bids</p>
                        <Link to="/search" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                            Browse auctions →
                        </Link>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="border-t border-border pt-8">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/create-auction" className="bg-primary text-primary-foreground rounded-lg p-4 text-center hover:opacity-90 transition-opacity">
                        <Gavel className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Create Auction</span>
                    </Link>
                    <Link to="/search" className="bg-card border border-border rounded-lg p-4 text-center hover:bg-muted transition-colors">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Browse Auctions</span>
                    </Link>
                    <button className="bg-card border border-border rounded-lg p-4 text-center hover:bg-muted transition-colors">
                        <Settings className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Account Settings</span>
                    </button>
                    <button className="bg-card border border-border rounded-lg p-4 text-center hover:bg-muted transition-colors text-urgency">
                        <LogOut className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
