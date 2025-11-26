import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageWrapperProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const PageWrapper = ({ children, showHeader = true, showFooter = true }: PageWrapperProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showHeader && <Header />}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-12">
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageWrapper;
