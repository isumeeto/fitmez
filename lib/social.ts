import { Post, UserProfile, CreatorProfile, Collection, Pin, OutfitPost } from "./types";
import { MOCK_POSTS, MOCK_PROFILE } from "./mock/data";
import { getSession, saveSession } from "./auth";

const POSTS_KEY = "dripcheck_posts";
const PROFILE_KEY = "dripcheck_profile";
const COLLECTIONS_KEY = "dripcheck_collections";

function getStoredPosts(): Post[] {
  if (typeof window === "undefined") return MOCK_POSTS;
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(MOCK_POSTS));
      return MOCK_POSTS;
    }
    const parsed = JSON.parse(raw) as Post[];
    if (!Array.isArray(parsed) || parsed.length < 10) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(MOCK_POSTS));
      return MOCK_POSTS;
    }
    const hasLegacyUnsplash = parsed.some(
      (p) =>
        (typeof p.image === "string" && p.image.includes("unsplash.com")) ||
        (typeof p.image_url === "string" && p.image_url.includes("unsplash.com"))
    );
    if (hasLegacyUnsplash) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(MOCK_POSTS));
      return MOCK_POSTS;
    }
    return parsed;
  } catch {
    return MOCK_POSTS;
  }
}

function saveStoredPosts(posts: Post[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error("Failed to save posts to localStorage:", err);
  }
}

export async function getPublicFeed(tab: 'curated' | 'community' = 'curated'): Promise<OutfitPost[]> {
  const posts = getStoredPosts();
  
  const transformed: OutfitPost[] = posts.map((p, idx) => {
    const rawUsername = p.username || p.author?.username || "curator";
    const cleanUsername = rawUsername.replace(/^u\//, "");
    const initial = cleanUsername.charAt(0).toUpperCase();
    const isCurated = idx % 2 === 0;
    
    const vibe = p.vibes?.[0] || p.tags?.[0] || (isCurated ? "Editorial" : "Streetwear");
    const temp = 17 + ((idx * 3) % 9);
    const context = `${vibe} • ${temp}°C`;

    const pins = (p.pins && p.pins.length > 0)
      ? p.pins.map((pin) => ({
          top: Math.round(pin.y * 100),
          left: Math.round(pin.x * 100),
          name: pin.note || pin.type || "Garment",
          type: pin.type,
        }))
      : [
          { top: 30, left: 45, name: "Vintage Bomber", type: "jacket" },
          { top: 65, left: 52, name: "Cream Chinos", type: "pants" },
        ];

    return {
      id: p.id,
      username: cleanUsername,
      avatar: initial,
      image: p.image || p.image_url,
      caption: p.caption,
      tags: p.tags && p.tags.length > 0 ? p.tags : ["Minimal", "Streetwear"],
      context,
      likes: p.likes || 142,
      matchCount: ((idx % 4) + 2),
      liked: Boolean(p.likedByMe || p.is_liked),
      saved: Boolean(p.savedByMe),
      pins,
    };
  });

  if (tab === "community") {
    // Show community-skewed list with high engagement
    const comm = transformed.filter((_, i) => i % 2 !== 0);
    const cur = transformed.filter((_, i) => i % 2 === 0);
    return [...comm, ...cur];
  }

  return transformed;
}

// TODO(backend): Replace with GET /feed?vibe=xxx
export async function getFeed(vibeFilter?: string): Promise<Post[]> {
  const posts = getStoredPosts();
  if (!vibeFilter || vibeFilter.toLowerCase() === "all") {
    return posts;
  }
  const cleanFilter = vibeFilter.toLowerCase();
  return posts.filter(
    (p) =>
      p.tags.some((tag) => tag.toLowerCase() === cleanFilter) ||
      (p.vibes && p.vibes.some((v) => v.toLowerCase() === cleanFilter))
  );
}

// TODO(backend): Replace with GET /posts/search?q=xxx&vibes=...&colors=...
export async function searchPosts(
  query: string,
  vibeFilters: string[] = [],
  colorFilters: string[] = []
): Promise<Post[]> {
  const posts = getStoredPosts();
  const q = query.trim().toLowerCase();

  return posts.filter((p) => {
    // Query text match
    let matchesQuery = true;
    if (q) {
      const matchTag = p.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchVibe = p.vibes?.some((v) => v.toLowerCase().includes(q));
      const matchCaption = p.caption.toLowerCase().includes(q);
      const matchUsername = (p.author?.username || p.username || "").toLowerCase().includes(q);
      matchesQuery = matchTag || matchVibe || matchCaption || matchUsername;
    }

    // Vibes filter match
    let matchesVibes = true;
    if (vibeFilters.length > 0) {
      matchesVibes = vibeFilters.some(
        (filter) =>
          p.vibes?.some((v) => v.toLowerCase() === filter.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase() === filter.toLowerCase())
      );
    }

    // Colors filter match
    let matchesColors = true;
    if (colorFilters.length > 0) {
      matchesColors = colorFilters.some((color) =>
        p.colors?.some((c) => c.toLowerCase() === color.toLowerCase())
      );
    }

    return matchesQuery && matchesVibes && matchesColors;
  });
}

// TODO(backend): Replace with GET /posts/:id
export async function getPost(id: string): Promise<Post | null> {
  const posts = getStoredPosts();
  const match = posts.find((p) => p.id === id);
  return match || null;
}

// TODO(backend): Replace with POST /posts
export async function createPost(data: {
  image_url: string;
  caption: string;
  tags: string[];
  vibes?: string[];
  colors?: string[];
  pins?: Pin[];
  is_anonymous: boolean;
}): Promise<Post> {
  const session = getSession();
  const username = data.is_anonymous
    ? session?.username || "u/anonymous"
    : session?.username || "u/creator";

  const newPost: Post = {
    id: "post-" + Date.now().toString(36),
    image: data.image_url,
    image_url: data.image_url,
    aspectRatio: 0.8,
    caption: data.caption,
    tags: data.tags,
    vibes: data.vibes || ["Streetwear"],
    colors: data.colors || ["navy", "white"],
    author: {
      username,
      orbSeed: username.replace("u/", ""),
    },
    username,
    likes: 1,
    likedByMe: true,
    savedByMe: false,
    is_liked: true,
    pins: data.pins || [],
    createdAt: "Just now",
    created_at: "Just now",
    user_id: session?.user_id,
  };

  const currentPosts = getStoredPosts();
  const updated = [newPost, ...currentPosts];
  saveStoredPosts(updated);

  // Update profile posts count
  try {
    const profile = await getProfile();
    await updateProfile({ posts_count: profile.posts_count + 1 });
  } catch (e) {
    console.error(e);
  }

  return newPost;
}

// TODO(backend): Replace with POST /posts/:id/like
export async function toggleLike(postId: string): Promise<{ is_liked: boolean; likes: number }> {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return { is_liked: false, likes: 0 };
  }

  const willBeLiked = !post.likedByMe && !post.is_liked;
  post.likedByMe = willBeLiked;
  post.is_liked = willBeLiked;
  post.likes = willBeLiked ? post.likes + 1 : Math.max(0, post.likes - 1);

  saveStoredPosts([...posts]);
  return { is_liked: willBeLiked, likes: post.likes };
}

// TODO(backend): Replace with POST /posts/:id/save
export async function toggleSave(postId: string): Promise<{ is_saved: boolean }> {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return { is_saved: false };
  }

  post.savedByMe = !post.savedByMe;
  saveStoredPosts([...posts]);
  return { is_saved: post.savedByMe };
}

// TODO(backend): Replace with GET /profile/:id
export async function getProfile(): Promise<UserProfile> {
  const session = getSession();

  if (typeof window === "undefined") {
    return MOCK_PROFILE;
  }

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      if (session?.username) {
        parsed.username = session.username;
        parsed.orbSeed = session.username.replace("u/", "");
      }
      return parsed;
    }
  } catch {
    // fallback
  }

  const initialProfile: UserProfile = {
    ...MOCK_PROFILE,
    user_id: session?.user_id || MOCK_PROFILE.user_id,
    username: session?.username || MOCK_PROFILE.username,
    orbSeed: (session?.username || MOCK_PROFILE.username).replace("u/", ""),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(initialProfile));
  return initialProfile;
}

// TODO(backend): Replace with PATCH /profile/:id
export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getProfile();
  const updated: UserProfile = { ...current, ...updates };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      if (updates.username) {
        const session = getSession();
        if (session) {
          saveSession({ ...session, username: updates.username });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return updated;
}

// TODO(backend): Replace with GET /users/:id/saved
export async function getSavedPosts(): Promise<Post[]> {
  const posts = getStoredPosts();
  return posts.filter((p) => p.savedByMe);
}

// COLLECTIONS (Feature 9)
export function getStoredCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) {
      const initial: Collection[] = [
        {
          id: "col-1",
          name: "Minimalist Essentials",
          postIds: ["post-01", "post-03", "post-04", "post-08"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "col-2",
          name: "Weekend Inspo",
          postIds: ["post-02", "post-07", "post-10", "post-13"],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Collection[];
  } catch {
    return [];
  }
}

export function saveStoredCollections(collections: Collection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (err) {
    console.error("Failed to save collections:", err);
  }
}

export async function createCollection(name: string, postIds: string[] = []): Promise<Collection> {
  const collections = getStoredCollections();
  const newCol: Collection = {
    id: "col-" + Date.now().toString(36),
    name: name.trim(),
    postIds,
    createdAt: new Date().toISOString(),
  };
  const updated = [newCol, ...collections];
  saveStoredCollections(updated);
  return newCol;
}

export async function addToCollection(collectionId: string, postId: string): Promise<boolean> {
  const collections = getStoredCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (!col) return false;
  if (!col.postIds.includes(postId)) {
    col.postIds.push(postId);
    saveStoredCollections([...collections]);
  }
  return true;
}

export async function removeFromCollection(collectionId: string, postId: string): Promise<boolean> {
  const collections = getStoredCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (!col) return false;
  col.postIds = col.postIds.filter((id) => id !== postId);
  saveStoredCollections([...collections]);
  return true;
}

export async function deleteCollection(collectionId: string): Promise<boolean> {
  const collections = getStoredCollections();
  const updated = collections.filter((c) => c.id !== collectionId);
  saveStoredCollections(updated);
  return true;
}

export async function updateCollectionName(id: string, name: string): Promise<boolean> {
  const collections = getStoredCollections();
  const col = collections.find((c) => c.id === id);
  if (!col) return false;
  col.name = name.trim();
  saveStoredCollections([...collections]);
  return true;
}

export async function getCollection(id: string): Promise<Collection | null> {
  const collections = getStoredCollections();
  return collections.find((c) => c.id === id) || null;
}

// ----------------------------------------------------
// FOLLOWERS & PUBLIC CREATOR PROFILES
// ----------------------------------------------------
const FOLLOWING_KEY = "dripcheck_following";

export function getFollowedUsers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOLLOWING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function isFollowingUser(username: string): boolean {
  const clean = username.replace(/^u\//, "").toLowerCase();
  const list = getFollowedUsers();
  return list.some((u) => u.toLowerCase() === clean);
}

export function toggleFollowUser(username: string): boolean {
  if (typeof window === "undefined") return false;
  const clean = username.replace(/^u\//, "").toLowerCase();
  const list = getFollowedUsers();
  const exists = list.some((u) => u.toLowerCase() === clean);
  let updated: string[];
  if (exists) {
    updated = list.filter((u) => u.toLowerCase() !== clean);
  } else {
    updated = [...list, clean];
  }
  try {
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("dripcheck_follow_changed", {
        detail: { username: clean, isFollowing: !exists },
      })
    );
  } catch (err) {
    console.error("Failed to update following in localStorage:", err);
  }
  return !exists;
}

const CREATOR_PRESETS: Record<
  string,
  {
    bio: string;
    vibes: string[];
    streak: number;
    items_count: number;
    orbSeed?: string;
  }
> = {
  elena_couture: {
    bio: "Architectural tailoring, monochrome palette & quiet luxury.",
    vibes: ["Old money", "Minimal", "Formal"],
    streak: 12,
    items_count: 24,
    orbSeed: "elena_01",
  },
  kai_streets: {
    bio: "Curating minimalist streetwear, heavyweight drape & tactical layers.",
    vibes: ["Streetwear", "Gorpcore", "Casual"],
    streak: 5,
    items_count: 18,
    orbSeed: "kai_02",
  },
  sora_minimal: {
    bio: "Less is more. Monochromatic essentials and fluid drape.",
    vibes: ["Minimal", "Smart casual", "Casual"],
    streak: 8,
    items_count: 21,
    orbSeed: "sora_03",
  },
  chloe_vintage: {
    bio: "70s textures, washed denim, and curated archival finds.",
    vibes: ["Vintage", "Casual", "Retro"],
    streak: 4,
    items_count: 16,
    orbSeed: "chloe_04",
  },
  marcus_formal: {
    bio: "Sharp lines, bespoke tailoring & modern formalwear.",
    vibes: ["Formal", "Old money", "Office"],
    streak: 7,
    items_count: 19,
    orbSeed: "marcus_05",
  },
  milo_tech: {
    bio: "Technical fabrics, weather-sealed membranes & functional aesthetics.",
    vibes: ["Gorpcore", "Streetwear", "Minimal"],
    streak: 9,
    items_count: 17,
    orbSeed: "milo_06",
  },
  yuki_tokyo: {
    bio: "Harajuku subtle, oversized silhouettes & avant-garde layering.",
    vibes: ["Streetwear", "Edgy", "Minimal"],
    streak: 6,
    items_count: 20,
    orbSeed: "yuki_07",
  },
  aria_drip: {
    bio: "High-energy styling, statement accents & elevated street.",
    vibes: ["Streetwear", "Casual", "Party"],
    streak: 11,
    items_count: 23,
    orbSeed: "aria_08",
  },
  zen_layer: {
    bio: "Fluid draping, earthy tones, relaxed linen & breathable knitwear.",
    vibes: ["Minimal", "Casual", "Vintage"],
    streak: 3,
    items_count: 15,
    orbSeed: "zen_09",
  },
};

export async function getCreatorPosts(username: string): Promise<Post[]> {
  const clean = username.replace(/^u\//, "").toLowerCase();
  const allPosts = getStoredPosts();

  const matched = allPosts.filter((p) => {
    const postAuthor = (p.author?.username || p.username || "")
      .replace(/^u\//, "")
      .toLowerCase();
    return postAuthor === clean;
  });

  if (matched.length > 0) {
    return matched;
  }

  // Fallback to stylish curated looks attributed to this creator
  return allPosts.slice(0, 4).map((p, idx) => ({
    ...p,
    id: `${clean}-fit-${idx + 1}`,
    username: `u/${clean}`,
    author: {
      username: `u/${clean}`,
      orbSeed: `${clean}_${idx}`,
    },
  }));
}

export async function getCreatorProfile(username: string): Promise<CreatorProfile> {
  const clean = username.replace(/^u\//, "").toLowerCase();
  const preset = CREATOR_PRESETS[clean];
  const posts = await getCreatorPosts(clean);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0) || 1280;
  const following = isFollowingUser(clean);

  return {
    user_id: `usr_${clean}`,
    username: `u/${clean}`,
    bio:
      preset?.bio ||
      "Curating architectural silhouettes & daily outfit inspirations on FITMEZ.",
    orbSeed: preset?.orbSeed || clean,
    avatar_gradient: clean,
    is_anonymous: false,
    posts_count: posts.length,
    likes_count: totalLikes,
    items_count: preset?.items_count ?? (12 + (clean.length % 8)),
    streak: preset?.streak ?? 3,
    vibes: preset?.vibes ?? ["Minimal", "Streetwear", "Smart casual"],
    isFollowing: following,
  };
}


