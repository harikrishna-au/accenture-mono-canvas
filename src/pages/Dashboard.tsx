import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";

const Dashboard = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, name: "Find Min", path: "/game/find-min" },
    { id: 2, name: "", path: "" },
    { id: 3, name: "", path: "" },
    { id: 4, name: "", path: "" },
    { id: 5, name: "", path: "" },
    { id: 6, name: "", path: "" },
    { id: 7, name: "", path: "" },
    { id: 8, name: "", path: "" },
    { id: 9, name: "", path: "" },
    { id: 10, name: "", path: "" },
    { id: 11, name: "", path: "" },
    { id: 12, name: "", path: "" },
  ];

  return (
    <PageWrapper>
      <SignedIn>
        <div className="h-screen flex items-center justify-center px-8">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-4 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className={`h-32 border-2 border-black rounded-2xl flex items-center justify-center p-6 ${
                    game.name
                      ? "bg-white hover:bg-black hover:text-white cursor-pointer transition-colors"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                  onClick={() => game.path && navigate(game.path)}
                >
                  {game.name && (
                    <span className="text-lg font-bold text-center">
                      {game.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to continue</h2>
          <SignInButton mode="modal">
            <OutlineButton variant="large">
              SIGN IN
            </OutlineButton>
          </SignInButton>
        </div>
      </SignedOut>
    </PageWrapper>
  );
};

export default Dashboard;
