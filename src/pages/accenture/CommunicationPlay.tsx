import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";

const CommunicationPlay = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            COMMUNICATION ROUND
          </h1>
          <button
            onClick={() => navigate("/accenture")}
            className="text-foreground hover:opacity-70 transition-opacity"
          >
            Exit
          </button>
        </div>

        {/* Placeholder container for custom communication logic */}
        <div 
          id="communication-container"
          className="border-2 border-border min-h-[600px] p-8 bg-background"
        >
          <div className="text-center text-foreground">
            <p className="text-xl mb-4">COMMUNICATION SIMULATION PLACEHOLDER</p>
            <p className="text-sm opacity-70">
              Insert your custom communication logic in this container
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CommunicationPlay;
