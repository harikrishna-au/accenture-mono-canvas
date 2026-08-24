// Shared visual tokens for the Infosys / HackWithInfy section.
// The palette is deliberately limited to one primary (Infosys blue), one accent
// (gold — reserved for the SP track) and a neutral, so every page in the
// section reads as one product instead of six unrelated colour schemes.

export type Tone = { color: string; bg: string; border: string };

export const INFY_BLUE = "#007CC3";
export const INFY_DARK = "#005A8E";
export const INFY_BG = "rgba(0,124,195,0.07)";
export const INFY_BDR = "rgba(0,124,195,0.18)";
export const INFY_GLOW = "rgba(0,124,195,0.15)";

export const GOLD = "#D97706";
export const GOLD_DARK = "#B45309";
export const GOLD_BG = "rgba(217,119,6,0.07)";
export const GOLD_BDR = "rgba(217,119,6,0.22)";

export const NEUTRAL = "#78716C";
export const NEUTRAL_BG = "rgba(120,113,108,0.07)";
export const NEUTRAL_BDR = "rgba(120,113,108,0.2)";

export const PRIMARY_TONE: Tone = { color: INFY_BLUE, bg: INFY_BG, border: INFY_BDR };
export const ACCENT_TONE: Tone = { color: GOLD, bg: GOLD_BG, border: GOLD_BDR };
export const NEUTRAL_TONE: Tone = { color: NEUTRAL, bg: NEUTRAL_BG, border: NEUTRAL_BDR };

// Difficulty escalates in visual weight within the accent hue rather than using
// a separate green/amber/red scale, which would reintroduce three more colours.
export const DIFF_STYLES: Record<"Easy" | "Medium" | "Hard", Tone> = {
  Easy: NEUTRAL_TONE,
  Medium: ACCENT_TONE,
  Hard: { color: GOLD_DARK, bg: "rgba(180,83,9,0.13)", border: "rgba(180,83,9,0.32)" },
};
