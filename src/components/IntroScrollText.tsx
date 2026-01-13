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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <h1
        className="text-6xl md:text-8xl font-bold text-foreground"
        style={{
          animation: "fadeUpward 3s ease-in-out forwards"
        }}
      >
        HARRY THE BLAZE
      </h1>
      <a
        href="https://www.youtube.com/@HarryTheBlaze"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-20 text-neutral-500 text-sm hover:text-red-500 transition-colors duration-300"
        style={{
          animation: "fadeIn 1s ease-in-out 0.5s forwards",
          opacity: 0
        }}
      >
        Subscribe to Channel ❤️
      </a>
      <style>{`
        @keyframes fadeUpward {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default IntroScrollText;
