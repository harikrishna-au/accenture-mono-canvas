import { useState, useEffect } from "react";

const IntroScrollText = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 50) {
        setHasScrolled(true);
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background pointer-events-none">
      <h1 
        className="text-6xl md:text-8xl font-bold text-foreground animate-fade-in"
        style={{
          animation: "fadeUpward 3s ease-in-out infinite"
        }}
      >
        HARRY THE BLAZE
      </h1>
      <style>{`
        @keyframes fadeUpward {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
      `}</style>
    </div>
  );
};

export default IntroScrollText;
