import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const Accenture = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          ACCENTURE PRACTICE
        </h1>
        
        <div className="space-y-6">
          <OutlineButton
            variant="large"
            onClick={() => navigate("/accenture/game/instructions")}
          >
            GAME-BASED ROUND
          </OutlineButton>
          
          <OutlineButton
            variant="large"
            onClick={() => navigate("/accenture/communication/instructions")}
          >
            COMMUNICATION ROUND
          </OutlineButton>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Accenture;
