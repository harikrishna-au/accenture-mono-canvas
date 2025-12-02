import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IntroScrollText from "@/components/IntroScrollText";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <IntroScrollText />
    </div>
  );
};

export default Landing;
