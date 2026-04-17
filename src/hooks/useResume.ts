import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from "@/pages/forge/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useResume() {
  const { user, isLoaded } = useUser();
  const [savedData, setSavedData] = useState<ResumeData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load on mount
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    supabase
      .from("resumes")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.data) setSavedData(data.data as ResumeData);
        setLoading(false);
      });
  }, [user, isLoaded]);

  const save = useCallback(async (resumeData: ResumeData) => {
    if (!user) return;
    setSaveStatus("saving");
    const { error } = await supabase
      .from("resumes")
      .upsert({ user_id: user.id, data: resumeData, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) {
      setSaveStatus("error");
    } else {
      setSavedData(resumeData);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }, [user]);

  return { savedData, loading, save, saveStatus, isSignedIn: !!user };
}
