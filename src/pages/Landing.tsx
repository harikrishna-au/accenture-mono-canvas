import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import IntroScrollText from "@/components/IntroScrollText";

const Landing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Capture Referral Code immediately on Landing
    const referralCode = searchParams.get("referral") || searchParams.get("refferal");
    if (referralCode) {
      localStorage.setItem("referral_coupon", referralCode);
      localStorage.setItem("auto_open_payment", "true");
    }

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <IntroScrollText />
    </div>
  );
};

export default Landing;
