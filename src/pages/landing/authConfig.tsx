export type AuthView = "sign-in" | "sign-up";

export const clerkAppearance = {
  variables: {
    colorPrimary: "#1c1c1e",
    colorBackground: "transparent",
    colorText: "#1c1c1e",
    colorTextSecondary: "#78716c",
    colorInputBackground: "#faf9f7",
    colorInputText: "#1c1c1e",
    colorDanger: "#dc2626",
    borderRadius: "12px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
  },
  elements: {
    rootBox: { width: "100%" },
    card: { boxShadow: "none", border: "none", padding: "0", backgroundColor: "transparent", width: "100%" },
    cardBox: { boxShadow: "none", border: "none", backgroundColor: "transparent", width: "100%" },
    main: { backgroundColor: "transparent", gap: "0.9rem" },

    // Hide Clerk's built-in header — the landing page renders its own branded
    // heading above the form, so showing Clerk's "Create your account" too
    // produced a confusing duplicate title.
    header: { display: "none" },

    // Form fields — match the card's stone/rounded styling
    form: { gap: "0.85rem" },
    formFieldLabel: {
      fontSize: "12.5px",
      fontWeight: "600",
      color: "#44403c",
      marginBottom: "4px",
    },
    formFieldInput: {
      backgroundColor: "#faf9f7",
      border: "1px solid #e7e5e0",
      borderRadius: "12px",
      fontSize: "14px",
      padding: "11px 14px",
      boxShadow: "none",
    },
    formButtonPrimary: {
      backgroundColor: "#1c1c1e",
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "none",
      borderRadius: "12px",
      padding: "11px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    },

    // Social / OAuth buttons
    socialButtonsBlockButton: {
      border: "1px solid #e7e5e0",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
    },
    socialButtonsBlockButtonText: { fontWeight: "500", color: "#44403c" },

    dividerLine: { backgroundColor: "#e7e5e0" },
    dividerText: { color: "#a8a29e", fontSize: "12px" },

    // Verification / OTP step
    identityPreview: { backgroundColor: "#faf9f7", border: "1px solid #e7e5e0", borderRadius: "10px" },
    otpCodeFieldInput: { border: "1px solid #e7e5e0", borderRadius: "10px" },
    formResendCodeLink: { color: "#1c1c1e", fontWeight: "600" },

    // We provide our own switch links below the form
    footer: { display: "none" },
    formFieldAction: { color: "#78716c", fontSize: "12px", fontWeight: "500" },
    formFieldInputShowPasswordButton: { color: "#a8a29e" },
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
