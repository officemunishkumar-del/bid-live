import { useState, useEffect } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

const FloatingElements = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Feedback tab */}
      <button className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-primary text-primary-foreground text-xs font-medium py-3 px-1.5 rounded-r-md writing-vertical-lr hidden md:block" style={{ writingMode: "vertical-lr" }}>
        Feedback
      </button>

      {/* Chat widget */}
      <button className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg hover:shadow-xl transition-shadow">
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-6 z-40 bg-background border border-border rounded-full p-2.5 shadow-md hover:shadow-lg transition-all animate-fade-in"
        >
          <ArrowUp className="h-4 w-4 text-foreground" />
        </button>
      )}
    </>
  );
};

export default FloatingElements;
