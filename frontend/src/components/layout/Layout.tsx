import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingElements from "./FloatingElements";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <FloatingElements />
  </div>
);

export default Layout;
