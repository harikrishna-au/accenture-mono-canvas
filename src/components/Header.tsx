import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="text-foreground text-xl font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          HARRY THE BLAZE
        </button>
        {user && (
          <button
            onClick={handleSignOut}
            className="text-foreground text-sm hover:opacity-70 transition-opacity"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
