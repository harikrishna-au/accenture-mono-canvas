import { useState, useEffect, useCallback } from "react";

const IntroScrollText = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const hideTimer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(hideTimer);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  if (!isVisible) return null;

  const dx = mouse.x - 0.5;
  const dy = mouse.y - 0.5;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 45%, #ffffff 0%, #edeae5 100%)",
      }}
    >
      <style>{`
        @keyframes orbF1 {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes orbF2 {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(16px); }
        }
        @keyframes orbF3 {
          0%,100% { transform: translateY(0px); }
          38% { transform: translateY(-12px); }
          72% { transform: translateY(9px); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes titleIn {
          0%   { opacity: 0; filter: blur(18px); transform: perspective(600px) rotateX(-10deg) translateY(28px); }
          40%  { opacity: 1; filter: blur(0);    transform: perspective(600px) rotateX(0deg)  translateY(0);    }
          82%  { opacity: 1; }
          100% { opacity: 0; filter: blur(7px);  transform: perspective(600px) rotateX(5deg)  translateY(-24px); }
        }
        @keyframes tagIn {
          0%   { opacity: 0; transform: translateY(10px); }
          35%  { opacity: 1; transform: translateY(0);    }
          82%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes lineL {
          0%   { transform: scaleX(0); opacity: 0; }
          25%  { opacity: 0.32; }
          55%  { transform: scaleX(1); opacity: 0.32; }
          82%  { opacity: 0.32; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes lineR {
          0%   { transform: scaleX(0); opacity: 0; }
          25%  { opacity: 0.32; }
          55%  { transform: scaleX(1); opacity: 0.32; }
          82%  { opacity: 0.32; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>

      {/* Perspective grid floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-28%",
          right: "-28%",
          height: "50%",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.052) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          transform: "perspective(480px) rotateX(62deg)",
          transformOrigin: "bottom center",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 62%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 62%)",
          animation: "gridFade 1.3s ease-out 0.3s both",
        }}
      />

      {/* ── Orb 1: cool blue, top-left ── */}
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "-5%",
          transition: "transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: `translate(${dx * -58}px, ${dy * -36}px)`,
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 34% 30%, rgba(198,218,255,0.93), rgba(162,198,255,0.16) 70%)",
            filter: "blur(2.5px)",
            animation: "orbF1 7.2s ease-in-out infinite",
            boxShadow:
              "inset 0 2px 7px rgba(255,255,255,0.85), 0 26px 72px rgba(148,184,255,0.09)",
          }}
        />
      </div>

      {/* ── Orb 2: blush rose, top-right ── */}
      <div
        style={{
          position: "absolute",
          top: "1%",
          right: "-1%",
          transition: "transform 0.62s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: `translate(${dx * 47}px, ${dy * 30}px)`,
        }}
      >
        <div
          style={{
            width: 265,
            height: 265,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 32%, rgba(255,220,232,0.94), rgba(255,172,200,0.16) 70%)",
            filter: "blur(1.8px)",
            animation: "orbF2 8.6s ease-in-out infinite",
            boxShadow:
              "inset 0 2px 5px rgba(255,255,255,0.88), 0 20px 58px rgba(255,158,185,0.07)",
          }}
        />
      </div>

      {/* ── Orb 3: sage mint, bottom-right ── */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "5%",
          transition: "transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: `translate(${dx * 40}px, ${dy * -24}px)`,
        }}
      >
        <div
          style={{
            width: 196,
            height: 196,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 36% 34%, rgba(196,255,224,0.91), rgba(145,238,190,0.16) 70%)",
            filter: "blur(1.2px)",
            animation: "orbF3 6.6s ease-in-out infinite",
            boxShadow:
              "inset 0 2px 4px rgba(255,255,255,0.88), 0 14px 42px rgba(118,220,166,0.07)",
          }}
        />
      </div>

      {/* ── Orb 4: warm gold, bottom-left ── */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "10%",
          transition: "transform 0.52s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: `translate(${dx * -30}px, ${dy * 20}px)`,
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 32%, rgba(255,245,198,0.96), rgba(248,218,132,0.16) 70%)",
            filter: "blur(0.6px)",
            animation: "orbF2 9.2s ease-in-out 2.1s infinite",
            boxShadow:
              "inset 0 1px 3px rgba(255,255,255,0.95), 0 9px 32px rgba(230,190,78,0.07)",
          }}
        />
      </div>

      {/* ── Center: 3D tilt block ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          transition: "transform 0.14s ease-out",
          transform: `perspective(900px) rotateX(${dy * -13}deg) rotateY(${dx * 13}deg)`,
        }}
      >
        {/* Top label */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9.5,
            fontWeight: 500,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#b0a89e",
            animation: "tagIn 3s cubic-bezier(0.22,1,0.36,1) 0.12s forwards",
            opacity: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#c8c0b6",
              animation: "dotPulse 2s ease-in-out 0.5s infinite",
            }}
          />
          Cognitive Platform
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#c8c0b6",
              animation: "dotPulse 2s ease-in-out 0.8s infinite",
            }}
          />
        </div>

        {/* Logo mark */}
        <img
          src="/favicon.svg"
          alt="Harry The Blaze"
          style={{
            width: 52,
            height: 52,
            animation: "titleIn 3s cubic-bezier(0.22,1,0.36,1) 0.08s forwards",
            opacity: 0,
            filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.18))",
          }}
        />

        {/* Title row + flanking lines */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Left line */}
          <div
            style={{
              position: "absolute",
              right: "calc(100% + 18px)",
              top: "50%",
              marginTop: -0.5,
              width: "20vw",
              height: 1,
              background:
                "linear-gradient(to left, rgba(0,0,0,0.14), transparent)",
              transformOrigin: "right center",
              animation: "lineL 3s ease 0.52s forwards",
              opacity: 0,
            }}
          />

          <h1
            style={{
              fontFamily: "'Merriweather', serif",
              fontSize: "clamp(2.1rem, 4.8vw, 4.6rem)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.08,
              animation:
                "titleIn 3s cubic-bezier(0.22,1,0.36,1) forwards",
              opacity: 0,
              background: "linear-gradient(148deg, #161616 18%, #545454 82%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HARRY THE BLAZE
          </h1>

          {/* Right line */}
          <div
            style={{
              position: "absolute",
              left: "calc(100% + 18px)",
              top: "50%",
              marginTop: -0.5,
              width: "20vw",
              height: 1,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.14), transparent)",
              transformOrigin: "left center",
              animation: "lineR 3s ease 0.52s forwards",
              opacity: 0,
            }}
          />
        </div>

        {/* Bottom label */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9.5,
            fontWeight: 400,
            letterSpacing: "0.3em",
            color: "#b0a89e",
            animation: "tagIn 3s cubic-bezier(0.22,1,0.36,1) 0.38s forwards",
            opacity: 0,
          }}
        >
          Interview Intelligence
        </div>
      </div>

      {/* Subscribe link */}
      <a
        href="https://www.youtube.com/@HarryTheBlaze"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          bottom: 30,
          fontFamily: "'Inter', sans-serif",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "#c4bdb5",
          textDecoration: "none",
          animation: "tagIn 2s ease-out 1.1s forwards",
          opacity: 0,
          transition: "color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#5a5248";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#c4bdb5";
        }}
      >
        Subscribe to Channel
      </a>
    </div>
  );
};

export default IntroScrollText;
