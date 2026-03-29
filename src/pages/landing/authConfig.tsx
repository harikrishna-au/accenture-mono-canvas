export type AuthView = "sign-in" | "sign-up";

export const clerkAppearance = {
  variables: {
    colorPrimary: "#1c1c1e",
    colorBackground: "transparent",
    colorText: "#1c1c1e",
    colorTextSecondary: "#78716c",
    colorInputBackground: "#faf9f7",
    colorInputText: "#1c1c1e",
    borderRadius: "12px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
  },
  elements: {
    card: { boxShadow: "none", border: "none", padding: "0", backgroundColor: "transparent" },
    cardBox: { boxShadow: "none", border: "none", backgroundColor: "transparent", width: "100%" },
    main: { backgroundColor: "transparent" },
    headerTitle: { fontSize: "0.95rem", fontWeight: "600", color: "#1c1c1e" },
    headerSubtitle: { fontSize: "0.8rem", color: "#78716c" },
    footer: { display: "none" },
    rootBox: { width: "100%" },
    formButtonPrimary: {
      backgroundColor: "#1c1c1e",
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
    },
    socialButtonsBlockButton: { border: "1px solid #e7e5e0" },
    dividerLine: { backgroundColor: "#e7e5e0" },
  },
};

export const AuthSkeleton = () => (
  <div className="animate-pulse space-y-5">
    <div className="flex gap-2 p-1 rounded-xl bg-stone-100 border border-stone-200">
      <div className="flex-1 h-8 rounded-[10px] bg-stone-200/70" />
      <div className="flex-1 h-8 rounded-[10px] bg-stone-100" />
    </div>
    <div className="space-y-2 pt-1">
      <div className="h-6 w-36 bg-stone-100 rounded-lg" />
      <div className="h-3.5 w-52 bg-stone-100 rounded-lg" />
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-10 bg-stone-100 rounded-xl border border-stone-200" />
      <div className="flex-1 h-10 bg-stone-100 rounded-xl border border-stone-200" />
    </div>
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-stone-100" />
      <div className="w-6 h-3 bg-stone-100 rounded" />
      <div className="flex-1 h-px bg-stone-100" />
    </div>
    <div className="space-y-1.5">
      <div className="h-3 w-24 bg-stone-100 rounded" />
      <div className="h-10 bg-stone-100 rounded-xl border border-stone-200" />
    </div>
    <div className="h-10 bg-stone-900/12 rounded-xl" />
  </div>
);
