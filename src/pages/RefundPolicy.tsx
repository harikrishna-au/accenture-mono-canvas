import { Link } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import Header from "@/components/Header";

const policies = [
  {
    title: "Refund Eligibility",
    body: "We want you to be satisfied with your purchase. Because our products are digital goods delivered via internet access, we generally offer no refunds. However, if you have not yet accessed any premium content, we will happily issue a refund upon request.",
  },
  {
    title: "Refund Requests",
    body: "Refund requests made after accessing premium content are handled on a case-by-case basis and are issued at our sole discretion. All refund requests must be submitted within 30 days of your original purchase.",
  },
  {
    title: "Cancellation",
    body: "You can cancel your subscription at any time. Your access to premium features will continue until the end of your current billing period, after which it will not renew.",
  },
  {
    title: "Contact Us",
    body: "If you have any questions about our refund or cancellation policy, please reach out to us by email. We aim to respond within 48 hours on business days.",
  },
];

const RefundPolicy = () => (
  <PageWrapper>
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#fcfcf9" }}>
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

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Page heading */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400 font-['Inter'] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" />
            Legal
          </div>
          <h1
            className="font-['Merriweather'] font-black text-stone-900 leading-[1.1] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Refund &amp; Cancellation
            <br />
            <span className="text-stone-400 font-light italic">Policy</span>
          </h1>
          <p className="font-['Inter'] text-[15px] text-stone-500 leading-relaxed max-w-xl">
            We believe in transparency. Here's everything you need to know about our refund and cancellation process.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {policies.map(({ title, body }, i) => (
            <div
              key={title}
              className="group bg-white rounded-2xl px-7 py-6 border border-stone-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-stone-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-50 border border-stone-200 font-['Inter'] text-[11px] font-bold text-stone-500 tabular-nums flex-shrink-0 transition-colors duration-300 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-600">
                  {i + 1 < 10 ? `0${i + 1}` : i + 1}
                </span>
                <h2 className="font-['Merriweather'] font-bold text-stone-800 text-[1.05rem]">{title}</h2>
              </div>
              <p className="font-['Inter'] text-[14px] text-stone-500 leading-relaxed pl-[2.6rem]">{body}</p>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-12 flex items-center gap-5 flex-wrap">
          {[
            { label: "Home", to: "/" },
            { label: "About", to: "/about" },
            { label: "Terms", to: "/terms" },
            { label: "Blog", to: "/blog" },
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
  </PageWrapper>
);

export default RefundPolicy;
