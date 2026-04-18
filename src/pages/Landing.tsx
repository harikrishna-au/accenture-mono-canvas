import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useAuth } from "@clerk/clerk-react";
import {
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { BarChart2, Brain, Trophy, Mic, Users, Radar } from "lucide-react";
import { AuthView } from "./landing/authConfig";
import { LandingBackground } from "./landing/LandingBackground";
import { LandingMobile } from "./landing/LandingMobile";
import { LandingDesktop } from "./landing/LandingDesktop";

const features = [
  { icon: BarChart2, label: "Company Dashboard", sub: "Top MNCs, IT firms & Fortune 500" },
  { icon: Brain, label: "AI Mock Interviews", sub: "Real-time adaptive feedback" },
  { icon: Trophy, label: "Gamified Aptitude", sub: "Learn through engaging games" },
  { icon: Mic, label: "Communication Rounds", sub: "Speaking, writing & fluency" },
  { icon: Users, label: "Placed Guru Sessions", sub: "1:1 with recently placed seniors" },
  { icon: Radar, label: "Radar — Job Match", sub: "Find roles that fit your skill profile", to: "/radar" },
];

export default function Landing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("sign-in");
  const [clerkStep, setClerkStep] = useState<string>("");
  const { isPremium } = usePremiumStatus();
  const { isLoaded } = useAuth();

  useEffect(() => {
    const onHash = () => setClerkStep(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isClerkVerificationStep = clerkStep.includes("verify") || clerkStep.includes("factor");

  /* 3-D tilt for auth card */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useTransform(my, [-160, 160], [7, -7]);
  const rY = useTransform(mx, [-160, 160], [-7, 7]);
  const sX = useSpring(rX, { stiffness: 350, damping: 38 });
  const sY = useSpring(rY, { stiffness: 350, damping: 38 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  /* referral code */
  useEffect(() => {
    const code = searchParams.get("referral") || searchParams.get("refferal");
    if (code) {
      localStorage.setItem("referral_coupon", code);
      localStorage.setItem("auto_open_payment", "true");
    }
  }, [searchParams]);

  const sharedProps = { view, setView, navigate, isPremium, isLoaded, isClerkVerificationStep, features };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#fcfcf9" }}>
      <LandingBackground />
      <LandingMobile {...sharedProps} />
      <LandingDesktop {...sharedProps} sX={sX} sY={sY} onMove={onMove} onLeave={onLeave} />
    </div>
  );
}
