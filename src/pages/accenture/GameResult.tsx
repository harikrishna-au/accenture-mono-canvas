import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const GameResult = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          GAME RESULTS
        </h1>
        
        <div className="mb-12 text-foreground">
          <p className="text-xl mb-4">Your performance summary will appear here</p>
          <p className="text-sm opacity-70">Score, time taken, and feedback</p>
        </div>

        <div className="space-x-4">
          <OutlineButton
            variant="default"
            onClick={() => navigate("/accenture/game/play")}
          >
            PLAY AGAIN
          </OutlineButton>
          
          <OutlineButton
            variant="default"
            onClick={() => navigate("/accenture")}
          >
            BACK TO ACCENTURE
          </OutlineButton>
        </div>
      </div>
    </PageWrapper>
  );
};

export default GameResult;
