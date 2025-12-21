import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) throw error;
        toast.success("Account created! Please check your email (including spam folder) to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper showHeader={false}>
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          {isSignUp ? "SIGN UP" : "SIGN IN"}
        </h1>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-foreground text-sm mb-2">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-foreground text-sm mb-2">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-background text-foreground border border-border rounded focus:outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>

          {isSignUp && (
            <p className="text-sm text-foreground/60 text-center px-4">
              Note: The verification email might arrive in your spam folder. Please check there if you don't see it in your inbox.
            </p>
          )}

          <OutlineButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "LOADING..." : isSignUp ? "SIGN UP" : "SIGN IN"}
          </OutlineButton>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground text-sm hover:opacity-70 transition-opacity"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex justify-center gap-4 text-xs text-foreground/50">
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <span>•</span>
          <a href="/refund" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Refund Policy
          </a>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Auth;
