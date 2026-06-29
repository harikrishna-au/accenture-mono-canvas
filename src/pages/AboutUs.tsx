import { Link } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import Header from "@/components/Header";

const sections = [
  {
    title: "Who We Are",
    body: "We are a passionate team dedicated to creating engaging and educational experiences for students preparing for campus placements. Our platform combines AI-powered mock interviews, gamified aptitude practice, and community-driven learning.",
  },
  {
    title: "Our Mission",
    body: "Our mission is to make placement preparation accessible, structured, and effective for every student — regardless of college tier or background. We believe every student deserves a fair shot at top companies.",
  },
  {
    title: "Contact",
    body: "Have questions or feedback? We'd love to hear from you. Reach out to our support team and we'll get back to you as soon as possible.",
  },
];

const AboutUs = () => (
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
            About Us
          </div>
          <h1
            className="font-['Merriweather'] font-black text-stone-900 leading-[1.1] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Helping students crack
            <br />
            <span className="text-stone-400 font-light italic">campus placements.</span>
          </h1>
          <p className="font-['Inter'] text-[15px] text-stone-500 leading-relaxed max-w-xl">
            Harry The Blaze is a campus placement accelerator built for students who want to stop guessing and start preparing with a real plan.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map(({ title, body }, i) => (
            <div
              key={title}
              className="bg-white rounded-2xl px-7 py-6 border border-stone-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-['Inter'] text-[11px] font-bold text-stone-300 tabular-nums">
                  0{i + 1}
                </span>
                <h2 className="font-['Merriweather'] font-bold text-stone-800 text-[1.05rem]">{title}</h2>
              </div>
              <p className="font-['Inter'] text-[14px] text-stone-500 leading-relaxed pl-7">{body}</p>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-12 flex items-center gap-5 flex-wrap">
          {[
            { label: "Home", to: "/" },
            { label: "Terms", to: "/terms" },
            { label: "Refund Policy", to: "/refund" },
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
  </PageWrapper>
);

export default AboutUs;
