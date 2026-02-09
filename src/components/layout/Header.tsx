import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Heart, ShoppingCart, User, Menu, X, Plus, LogOut } from "lucide-react";
import { categories } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold font-sans tracking-tight text-foreground">
                live<span className="text-primary">bid</span>
              </h1>
            </Link>

            {/* Search - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search items and auction houses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Action Icons */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && (
                <Link
                  to="/create-auction"
                  className="flex flex-col items-center px-3 py-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] mt-0.5">Create</span>
                </Link>
              )}
              {[
                { icon: Bell, label: "Alerts" },
                { icon: Heart, label: "My Items" },
                { icon: ShoppingCart, label: "Won Items" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="flex flex-col items-center px-3 py-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] mt-0.5">{label}</span>
                </button>
              ))}

              {/* User Account */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex flex-col items-center px-3 py-1 text-foreground transition-colors"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-[10px] mt-0.5">{user?.name?.split(" ")[0] || "Account"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex flex-col items-center px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5">Sign In</span>
                  </button>
                )}

                {/* User Dropdown */}
                {showUserDropdown && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/create-auction"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Create Auction
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-urgency hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items and auction houses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Secondary nav */}
        <div className="border-t border-border bg-background">
          <div className="container mx-auto px-4">
            <div className="hidden md:flex items-center justify-between h-10 text-sm overflow-x-auto">
              <div className="flex items-center gap-6">
                {categories.map((cat) => (
                  <Link key={cat} to={`/search?category=${encodeURIComponent(cat)}`} className="text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <Link to="/search" className="text-muted-foreground hover:text-foreground whitespace-nowrap">📅 Upcoming</Link>
                <Link to="/search" className="text-muted-foreground hover:text-foreground whitespace-nowrap">📍 Near Me</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <div className="p-4 space-y-3">
              {categories.map((cat) => (
                <Link key={cat} to={`/search?category=${encodeURIComponent(cat)}`} className="block py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setShowMobileMenu(false)}>
                  {cat}
                </Link>
              ))}
              <div className="border-t border-border pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="text-sm text-foreground font-medium">
                      My Profile
                    </Link>
                    <Link to="/create-auction" onClick={() => setShowMobileMenu(false)} className="text-sm text-primary font-medium">
                      + Create Auction
                    </Link>
                    <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="text-sm text-urgency font-medium text-left">
                      Log Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }} className="text-sm text-primary font-medium">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Click outside to close dropdown */}
      {showUserDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default Header;
