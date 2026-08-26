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
    // Clerk's cardBox ships with overflow-x: hidden for its own card transitions.
    // Once the card border and padding are removed above, the form content sits a
    // pixel to the left of that clip edge, which shaved the vertical stem off the
    // first letter of every field label — "Email address" rendered as ".mail address".
    cardBox: {
      boxShadow: "none",
      border: "none",
      backgroundColor: "transparent",
      width: "100%",
      overflow: "visible",
    },
    main: { backgroundColor: "transparent", gap: "0.9rem" },

    // Hide Clerk's built-in header — the landing page renders its own branded
    // heading above the form, so showing Clerk's "Create your account" too
    // produced a confusing duplicate title.
    header: { display: "none" },

    // Form fields — match the card's stone/rounded styling
    form: { gap: "0.85rem" },
    formFieldLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#44403c",
      marginBottom: "4px",
    },
    // 16px is the threshold below which iOS Safari zooms the page when a field is
    // focused; at 14px, tapping the email box zoomed the whole layout in. The
    // min-height keeps the field a comfortable 44px finger target.
    formFieldInput: {
      backgroundColor: "#faf9f7",
      border: "1px solid #e7e5e0",
      borderRadius: "12px",
      fontSize: "16px",
      padding: "12px 14px",
      minHeight: "46px",
      boxShadow: "none",
    },
    formButtonPrimary: {
      backgroundColor: "#1c1c1e",
      fontFamily: "'Inter', sans-serif",
      fontSize: "15px",
      fontWeight: "600",
      textTransform: "none",
      borderRadius: "12px",
      padding: "13px",
      minHeight: "48px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    },

    // Social / OAuth buttons
    socialButtonsBlockButton: {
      border: "1px solid #e7e5e0",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      minHeight: "46px",
    },
    socialButtonsBlockButtonText: { fontWeight: "500", color: "#44403c" },

    dividerLine: { backgroundColor: "#e7e5e0" },
    dividerText: { color: "#a8a29e", fontSize: "12px" },

    // Verification / OTP step
    identityPreview: { backgroundColor: "#faf9f7", border: "1px solid #e7e5e0", borderRadius: "10px" },
    otpCodeFieldInput: { border: "1px solid #e7e5e0", borderRadius: "10px", fontSize: "16px" },
    formResendCodeLink: { color: "#1c1c1e", fontWeight: "600" },

    // We provide our own switch links below the form
    footer: { display: "none" },
    formFieldAction: { color: "#78716c", fontSize: "12px", fontWeight: "500" },
    formFieldInputShowPasswordButton: { color: "#a8a29e" },
  },
};

export const AuthSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex gap-1 p-1 rounded-xl bg-stone-100">
      <div className="flex-1 h-10 rounded-[10px] bg-white" />
      <div className="flex-1 h-10 rounded-[10px] bg-transparent" />
    </div>
    <div className="space-y-1.5">
      <div className="h-3 w-24 bg-stone-100 rounded" />
      <div className="h-11 bg-stone-50 rounded-xl border border-stone-100" />
    </div>
    <div className="h-12 bg-stone-900/10 rounded-xl" />
  </div>
);
