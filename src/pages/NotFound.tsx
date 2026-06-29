import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#fcfcf9" }}>
      <Header />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: "radial-gradient(circle, #c4bdb4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] blur-[120px] opacity-40"
          style={{ background: "radial-gradient(ellipse, rgba(201,164,110,0.16) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[400px] h-[400px] blur-[100px] opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(168,162,158,0.12) 0%, transparent 70%)" }}
        />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center -mt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-100 text-[11px] font-['Inter'] font-semibold text-stone-400 mb-7 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" />
          404 — Page not found
        </div>

        <h1
          className="font-['Merriweather'] font-black text-stone-900 leading-none tracking-tight mb-4"
          style={{ fontSize: "clamp(4rem, 12vw, 8rem)" }}
        >
          Lost?
        </h1>

        <p className="font-['Inter'] text-[15px] text-stone-500 max-w-xs leading-relaxed mb-9">
          We couldn't find <span className="text-stone-700 font-medium">{location.pathname}</span>. It may have moved or the URL might be wrong.
        </p>

        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          Back to Home
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-10 flex items-center gap-5">
          {[
            { label: "Blog", to: "/blog" },
            { label: "About", to: "/about" },
            { label: "Connect", to: "/connect" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-[11.5px] font-['Inter'] text-stone-400 hover:text-stone-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotFound;
