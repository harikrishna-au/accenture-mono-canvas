import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="text-foreground text-xl font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          HARRY THE BLAZE
        </button>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-foreground text-sm hover:opacity-70 transition-opacity">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
