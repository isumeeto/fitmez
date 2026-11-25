import { Badge, Streak } from "./types";

export const ALL_BADGES: Badge[] = [
  {
    id: "first_post",
    label: "First Post",
    description: "Published your debut outfit to the community.",
  },
  {
    id: "streak_5",
    label: "5-Day Streak",
    description: "Logged or styled outfits 5 days in a row.",
  },
  {
    id: "wardrobe_10",
    label: "10 Pieces Added",
    description: "Built a solid wardrobe foundation in your digital closet.",
  },
  {
    id: "first_recreate",
    label: "Style Recreator",
    description: "Recreated a community look with your own wardrobe.",
  },
  {
    id: "style_dna_shared",
    label: "DNA Explorer",
    description: "Generated and shared your unique Style DNA card.",
  },
  {
    id: "early_adopter",
    label: "Early Adopter",
    description: "Joined FITMEZ in the inaugural cohort.",
  },
];

const STREAK_KEY = "dripcheck_streak";
const UNLOCKED_BADGES_KEY = "dripcheck_badges";

export function getStreak(): Streak {
  if (typeof window === "undefined") return { count: 3, lastDate: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      const initial: Streak = { count: 3, lastDate: new Date().toISOString() };
      localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Streak;
  } catch {
    return { count: 3, lastDate: new Date().toISOString() };
  }
}

export function recordStreakActivity(): Streak {
  if (typeof window === "undefined") return { count: 3, lastDate: new Date().toISOString() };
  const current = getStreak();
  const today = new Date().toDateString();
  const lastDate = new Date(current.lastDate).toDateString();

  if (today === lastDate) {
    return current;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let newCount = 1;
  if (yesterday.toDateString() === lastDate) {
    newCount = current.count + 1;
  }

  const updated: Streak = { count: newCount, lastDate: new Date().toISOString() };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  } catch {}

  if (newCount >= 5) {
    unlockBadge("streak_5");
  }

  return updated;
}

export function getUnlockedBadges(): Record<string, string> {
  if (typeof window === "undefined") {
    return {
      early_adopter: new Date().toISOString(),
      first_post: new Date().toISOString(),
      wardrobe_10: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
    if (!raw) {
      const initial = {
        early_adopter: new Date().toISOString(),
        first_post: new Date().toISOString(),
        wardrobe_10: new Date().toISOString(),
      };
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Object.keys(parsed).length < 3) {
      parsed.early_adopter = parsed.early_adopter || new Date().toISOString();
      parsed.first_post = parsed.first_post || new Date().toISOString();
      parsed.wardrobe_10 = parsed.wardrobe_10 || new Date().toISOString();
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {
      early_adopter: new Date().toISOString(),
      first_post: new Date().toISOString(),
      wardrobe_10: new Date().toISOString(),
    };
  }
}

export function unlockBadge(badgeId: string): boolean {
  if (typeof window === "undefined") return false;
  const unlocked = getUnlockedBadges();
  if (unlocked[badgeId]) return false; // already unlocked

  unlocked[badgeId] = new Date().toISOString();
  try {
    localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(unlocked));
    window.dispatchEvent(new CustomEvent("dripcheck_badge_unlocked", { detail: { badgeId } }));
  } catch {}
  return true;
}
