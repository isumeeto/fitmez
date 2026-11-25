export const APP_NAME = "FITMEZ";
export const STYLIST_TAB_LABEL = "MIW AI";

/**
 * FITMEZ Color Palette System
 * Primary Accent: Matcha (#9CA763)
 * Light Theme Background: Milk Honey (#F1E8C7)
 * Dark Theme: Dark Cream Roasted Noir (#161811) + Matcha
 */
export const THEME_COLORS = {
  matcha: "#9CA763",
  milkHoney: "#F1E8C7",
  light: {
    bg: "#F1E8C7",
    bg2: "#E7DDB8",
    surface: "#FAF5E4",
    surface2: "#EDE2BF",
    border: "rgba(70, 77, 36, 0.12)",
    borderStrong: "rgba(70, 77, 36, 0.22)",
    text: "#242B18",
    textMuted: "#5C6645",
    textSubtle: "#828D69",
    accent: "#7D8B45",
    accentSoft: "#9CA763",
    accentDeep: "#687434",
    accentTint: "rgba(156, 167, 99, 0.20)",
    accentLine: "rgba(125, 139, 69, 0.45)",
    accentGlow: "rgba(156, 167, 99, 0.45)",
    onAccent: "#FAF5E4",
    btnBg: "#9CA763",
    btnFg: "#1C2312",
    bubble: "#9CA763",
    onBubble: "#1C2312",
    glassRgb: "241, 232, 199",
  },
  dark: {
    bg: "#161811",
    bg2: "#1D2017",
    surface: "#24291E",
    surface2: "#2E3526",
    border: "rgba(156, 167, 99, 0.16)",
    borderStrong: "rgba(156, 167, 99, 0.28)",
    text: "#F4F0E1",
    textMuted: "#ACB694",
    textSubtle: "#778163",
    accent: "#9CA763",
    accentSoft: "#B5C17F",
    accentDeep: "#7F8A4B",
    accentTint: "rgba(156, 167, 99, 0.16)",
    accentLine: "rgba(156, 167, 99, 0.40)",
    accentGlow: "rgba(156, 167, 99, 0.32)",
    onAccent: "#161811",
    btnBg: "#9CA763",
    btnFg: "#161811",
    bubble: "#9CA763",
    onBubble: "#161811",
    glassRgb: "36, 41, 30",
  },
} as const;

export const OCCASIONS = [
  { id: "casual", label: "Casual", description: "Relaxed everyday wear" },
  { id: "office", label: "Office", description: "Smart, professional & sharp" },
  { id: "date", label: "Date Night", description: "Effortless, flattering & clean" },
  { id: "party", label: "Party", description: "Statement pieces & standout vibes" },
] as const;

export const STYLE_FILTERS = [
  "All",
  "Streetwear",
  "Minimal",
  "Formal",
  "Casual",
  "Date",
  "Party",
  "Office",
] as const;

export const TRENDING_STYLES = [
  "Old money",
  "Streetwear",
  "Minimal",
  "Y2K",
  "Korean casual",
  "Techwear",
  "Smart casual",
  "Quiet luxury",
  "Vintage 90s",
] as const;

export const CLOTHING_TYPES = [
  "shirt",
  "pants",
  "shoes",
  "jacket",
  "accessory",
] as const;

export const ALL_OCCASION_TAGS = [
  "casual",
  "office",
  "date",
  "party",
  "wedding",
  "vacation",
  "interview",
  "college",
] as const;

export const ALL_STYLE_TAGS = [
  "streetwear",
  "minimal",
  "formal",
  "casual",
  "vintage",
  "sporty",
] as const;
