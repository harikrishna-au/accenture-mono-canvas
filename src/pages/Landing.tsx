import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IntroScrollText from "@/components/IntroScrollText";

const Landing = () => {
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNavigated && window.scrollY > 50) {
        setHasNavigated(true);
        navigate("/dashboard");
      }
    };

    // Add content to make page scrollable
    document.body.style.minHeight = "200vh";

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.minHeight = "";
    };
  }, [hasNavigated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <IntroScrollText />
    </div>
  );
};

export default Landing;
