export type ClothingType = "shirt" | "pants" | "shoes" | "jacket" | "accessory" | string;
export type Pattern = "solid" | "stripes" | "checks" | "floral" | string;
export type Fit = "slim" | "regular" | "oversized" | string;
export type Style = "casual" | "formal" | "streetwear" | "minimal" | string;
export type Season = "summer" | "winter" | "all-season" | string;
export type Occasion = "casual" | "office" | "date" | "party" | string;

export interface Item {
  id: string;
  image_url: string;
  type: ClothingType;
  color: string;
  pattern?: Pattern;
  fit?: Fit;
  style?: Style;
  season?: Season;
  occasion?: Occasion;
}

export interface RecommendResponse {
  outfit_id: string;
  items: Pick<Item, "id" | "type" | "color">[];
  explanation: string;
}

export interface Pin {
  x: number;
  y: number;
  type: string;
  note?: string;
  itemId?: string;
}

export interface Post {
  id: string;
  image: string;
  image_url: string;
  aspectRatio: number;
  aspect_ratio?: string;
  caption: string;
  tags: string[];
  vibes: string[];
  colors: string[];
  author: {
    username: string;
    orbSeed: string;
  };
  username: string;
  likes: number;
  likedByMe: boolean;
  savedByMe: boolean;
  is_liked: boolean;
  pins?: Pin[];
  featured?: boolean;
  createdAt: string;
  created_at: string;
  user_id?: string;
}

export interface OutfitPost {
  id: string;
  username: string;
  avatar?: string;
  image: string;
  caption: string;
  tags: string[];
  context: string; // e.g., "Streetwear • 18°C"
  likes: number;
  matchCount: number;
  liked: boolean;
  saved?: boolean;
  pins?: {
    x?: number;
    y?: number;
    type?: string;
    note?: string;
    name?: string;
    top?: number;
    left?: number;
  }[];
}

export interface Collection {
  id: string;
  name: string;
  postIds: string[];
  createdAt: string;
}

export interface Streak {
  count: number;
  lastDate: string;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  unlockedAt?: string;
}

export interface MatchResult {
  postId: string;
  matched: {
    itemId: string;
    matchPct: number;
  }[];
  missing: string[];
}

export interface FitScore {
  total: number;
  fit: number;
  color: number;
  occasion: number;
  accessories: number;
  tips: string[];
}

export interface UserProfile {
  user_id: string;
  username: string;
  bio: string;
  avatar_gradient?: string;
  orbSeed?: string;
  is_anonymous: boolean;
  posts_count: number;
  likes_count: number;
  items_count: number;
}

export interface CreatorProfile extends UserProfile {
  streak: number;
  vibes: string[];
  isFollowing?: boolean;
}

export interface AuthSession {
  user_id: string;
  email?: string;
  username: string;
  is_guest: boolean;
  created_at: string;
}
