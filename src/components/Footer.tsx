import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-stone-100" style={{ background: "#fcfcf9" }}>
    <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="font-['Inter'] text-[12px] text-stone-400">
        © 2025 <span className="font-semibold text-stone-500">HARRY THE BLAZE</span>
      </p>
      <div className="flex items-center gap-5">
        {[
          { label: "About", to: "/about" },
          { label: "Terms", to: "/terms" },
          { label: "Refund Policy", to: "/refund" },
          { label: "Blog", to: "/blog" },
        ].map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className="font-['Inter'] text-[11.5px] text-stone-400 hover:text-stone-700 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
