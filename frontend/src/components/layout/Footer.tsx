import { Link } from "react-router-dom";

const footerLinks = {
  Company: ["About", "Careers", "Press", "Blog"],
  Winning: ["How to Bid", "Shipping", "Returns", "Buyer Guide"],
  Selling: ["Sell with Us", "Pricing", "Resources"],
  Help: ["Support Center", "FAQs", "Contact Us"],
};

const Footer = () => (
  <footer className="bg-foreground text-background">
    {/* Trust badges */}
    <div className="border-b border-background/10">
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider mb-4">Shop with Confidence</p>
        <div className="flex justify-center gap-8 text-xs text-background/60">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🔒</span>
            <span>Secure Payments</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">✅</span>
            <span>Verified Sellers</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🛡️</span>
            <span>Buyer Protection</span>
          </div>
        </div>
      </div>
    </div>

    {/* Links */}
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-semibold text-sm mb-3 font-sans">{title}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <Link to="/" className="text-sm text-background/60 hover:text-background transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-sans">Social</h4>
          <div className="flex gap-3 text-background/60">
            {["𝕏", "f", "in", "📌", "📺"].map((s, i) => (
              <span key={i} className="hover:text-background cursor-pointer transition-colors">{s}</span>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <button className="block w-full text-left text-xs bg-background/10 rounded px-3 py-2 hover:bg-background/20 transition-colors">📱 Download iOS App</button>
            <button className="block w-full text-left text-xs bg-background/10 rounded px-3 py-2 hover:bg-background/20 transition-colors">▶ Download Android App</button>
          </div>
        </div>
      </div>
    </div>

    {/* Legal */}
    <div className="border-t border-background/10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-background/40 gap-2">
        <span>© 2026 LiveBid. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-background/70">Terms of Service</Link>
          <Link to="/" className="hover:text-background/70">Privacy Policy</Link>
          <Link to="/" className="hover:text-background/70">Cookie Settings</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
