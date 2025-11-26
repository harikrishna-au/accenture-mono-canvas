import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IntroScrollText from "@/components/IntroScrollText";
import OutlineButton from "@/components/OutlineButton";
import PageWrapper from "@/components/PageWrapper";

const Landing = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 50) {
        setHasScrolled(true);
        setShowButton(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  return (
    <>
      <IntroScrollText />
      <PageWrapper showHeader={false} showFooter={false}>
        <div className="text-center">
          {showButton && (
            <div className="animate-fade-in">
              <OutlineButton
                variant="large"
                onClick={() => navigate("/dashboard")}
              >
                ENTER
              </OutlineButton>
            </div>
          )}
          {!showButton && (
            <p className="text-foreground text-sm mt-8 opacity-50">
              Scroll to continue...
            </p>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default Landing;
