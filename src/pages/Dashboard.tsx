import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="text-center">
        <OutlineButton
          variant="large"
          onClick={() => navigate("/accenture")}
        >
          ACCENTURE
        </OutlineButton>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
