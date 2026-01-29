import { useState, useEffect } from "react";

const IntroScrollText = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after animation completes (3 seconds)
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(autoHideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fcfcf9]">
      <h1
        className="text-5xl md:text-7xl font-bold text-stone-800 tracking-tight"
        style={{
          fontFamily: "'Merriweather', serif",
          animation: "beholdReveal 4s cubic-bezier(0.22, 1, 0.36, 1) forwards"
        }}
      >
        HARRY THE BLAZE
      </h1>
      <a
        href="https://www.youtube.com/@HarryTheBlaze"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-20 text-stone-400 text-xs font-semibold tracking-[0.2em] uppercase hover:text-secondary transition-colors duration-700"
        style={{
          fontFamily: "'Inter', sans-serif",
          animation: "calmFadeIn 2s ease-out 1.5s forwards",
          opacity: 0
        }}
      >
        Subscribe to Channel <span className="text-secondary/70">●</span>
      </a>
      <style>{`
        @keyframes beholdReveal {
          0% {
            opacity: 0;
            transform: translateY(15px);
            filter: blur(8px);
          }
          40% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
            filter: blur(5px);
          }
        }
        @keyframes calmFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default IntroScrollText;
