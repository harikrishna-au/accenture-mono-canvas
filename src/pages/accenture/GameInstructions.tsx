import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const GameInstructions = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          GAME-BASED ROUND INSTRUCTIONS
        </h1>
        
        <div className="space-y-4 mb-12 text-foreground">
          <ul className="list-disc list-inside space-y-2">
            <li>Read each scenario carefully</li>
            <li>Make strategic decisions based on the information provided</li>
            <li>Consider both short-term and long-term consequences</li>
            <li>Time management is crucial</li>
            <li>There may be multiple correct approaches</li>
          </ul>
        </div>

        <div className="text-center">
          <OutlineButton
            variant="default"
            onClick={() => navigate("/accenture/game/play")}
          >
            START GAME
          </OutlineButton>
        </div>
      </div>
    </PageWrapper>
  );
};

export default GameInstructions;
