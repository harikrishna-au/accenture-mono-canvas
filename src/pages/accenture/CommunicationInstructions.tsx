import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const CommunicationInstructions = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          COMMUNICATION ROUND INSTRUCTIONS
        </h1>
        
        <div className="space-y-4 mb-12 text-foreground">
          <ul className="list-disc list-inside space-y-2">
            <li>Demonstrate clear and effective communication</li>
            <li>Structure your responses logically</li>
            <li>Use professional language and tone</li>
            <li>Address all aspects of the scenario</li>
            <li>Show empathy and understanding</li>
          </ul>
        </div>

        <div className="text-center">
          <OutlineButton
            variant="default"
            onClick={() => navigate("/accenture/communication/play")}
          >
            START SIMULATION
          </OutlineButton>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CommunicationInstructions;
