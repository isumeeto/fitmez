# DripCheck AI — Backend API Specifications & Integration Needs

> **Document Version:** 1.0 (Prompt 03 Redesign)  
> **Target Audience:** Backend & AI Engineering Partner  
> **Status:** Specification for backend endpoints replacing current frontend mock services (`lib/social.ts`, `lib/ai.ts`, `lib/badges.ts`). All contracts below match the frontend TypeScript interfaces in `lib/types.ts`.

---

## 1. Authentication & Session Context

- **Session Identification:** Frontend passes `dripcheck_session` token via `Authorization: Bearer <token>` or HTTP cookie.
- **Anonymous Identity:** Users can post anonymously. The backend should generate or store an anonymous pseudonym while mapping the post to the internal user ID for ownership/moderation.

---

## 2. Social Feed & Exploration

### 2.1 Feed List (Cursor Pagination)
Retrieves the community masonry feed with editorial rhythms.

- **Endpoint:** `GET /api/v1/posts`
- **Query Parameters:**
  - `cursor` (string, optional): Pagination cursor from previous page.
  - `limit` (integer, default: 12): Number of posts per page.
  - `vibe` (string, optional): Filter by aesthetic category (e.g., `Streetwear`, `Minimal`, `Old money`).
- **Response Shape (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-01",
      "image": "https://cdn.example.com/posts/01.jpg",
      "aspectRatio": 0.8,
      "caption": "Tonal morning drape. Heavy cotton crewneck with pleated wool trousers.",
      "tags": ["Minimal", "Smart casual", "Autumn"],
      "vibes": ["Minimal", "Smart casual"],
      "colors": ["navy", "beige"],
      "author": {
        "username": "u/monochrome_mind",
        "orbSeed": "monochrome_mind"
      },
      "likes": 248,
      "likedByMe": false,
      "savedByMe": false,
      "pins": [
        {
          "x": 0.48,
          "y": 0.32,
          "type": "shirt",
          "note": "Relaxed wool blend overshirt"
        },
        {
          "x": 0.52,
          "y": 0.65,
          "type": "pants",
          "note": "Pleated wide-leg trousers"
        }
      ],
      "featured": false,
      "createdAt": "2h ago"
    }
  ],
  "nextCursor": "cursor_eyJpZCI6MTB9",
  "hasMore": true
}
```

---

### 2.2 Visual Search & Filter
Filters feed by text query, multi-select style vibes, and garment colors.

- **Endpoint:** `GET /api/v1/search`
- **Query Parameters:**
  - `q` (string, optional): Text keyword search.
  - `vibes` (string, optional): Comma-separated list of vibes (e.g. `Minimal,Streetwear`).
  - `colors` (string, optional): Comma-separated list of colors (e.g. `navy,white,beige`).
  - `limit` (integer, default: 20): Maximum results to return.
- **Response Shape (200 OK):**
```json
{
  "results": [ /* Array of Post objects */ ],
  "total": 42,
  "trendingTags": ["Minimal", "Quiet Luxury", "Gorpcore", "Y2K", "Office"]
}
```

---

### 2.3 Get Single Post Detail
- **Endpoint:** `GET /api/v1/posts/{id}`
- **Response Shape (200 OK):** Single `Post` object including tag pins and author info.

---

### 2.4 Create Post with Tag Pins
Creates an outfit post with garment pins, AI tags, and anonymous toggle.

- **Endpoint:** `POST /api/v1/posts`
- **Request Body:**
```json
{
  "image_url": "https://storage.supabase.co/v0/b/.../post.jpg",
  "caption": "Sunday architectural silhouette with draped coat.",
  "tags": ["Minimal", "Tailored"],
  "vibes": ["Minimal", "Smart casual"],
  "colors": ["navy", "black"],
  "is_anonymous": true,
  "pins": [
    {
      "x": 0.5,
      "y": 0.35,
      "type": "jacket",
      "note": "Vintage boxy wool coat",
      "itemId": "item_123"
    }
  ]
}
```
- **Response Shape (201 Created):** Newly created `Post` object.

---

### 2.5 Like / Unlike Post
Optimistic toggle for liking community posts.

- **Endpoint:** `POST /api/v1/posts/{id}/like`
- **Request Body:** `{}`
- **Response Shape (200 OK):**
```json
{
  "id": "post-01",
  "likes": 249,
  "is_liked": true
}
```

---

## 3. Collections (Moodboards)

### 3.1 List User Collections
- **Endpoint:** `GET /api/v1/collections`
- **Response Shape (200 OK):**
```json
[
  {
    "id": "col-1",
    "name": "Capsule Staples",
    "postIds": ["post-01", "post-03", "post-08"],
    "createdAt": "2026-10-13T10:00:00Z"
  }
]
```

### 3.2 Create Collection
- **Endpoint:** `POST /api/v1/collections`
- **Request Body:**
```json
{
  "name": "Autumn Layering",
  "postIds": ["post-01"]
}
```
- **Response Shape (201 Created):** `Collection` object.

### 3.3 Add Post to Collection
- **Endpoint:** `POST /api/v1/collections/{id}/items`
- **Request Body:**
```json
{
  "postId": "post-04"
}
```
- **Response Shape (200 OK):** `{ "success": true, "collection": { ... } }`

### 3.4 Remove Post from Collection
- **Endpoint:** `DELETE /api/v1/collections/{id}/items/{postId}`
- **Response Shape (200 OK):** `{ "success": true }`

### 3.5 Rename Collection
- **Endpoint:** `PATCH /api/v1/collections/{id}`
- **Request Body:**
```json
{
  "name": "Winter Layering Staples"
}
```
- **Response Shape (200 OK):** Updated `Collection` object.

### 3.6 Delete Collection
- **Endpoint:** `DELETE /api/v1/collections/{id}`
- **Response Shape (200 OK):** `{ "success": true }`

---

## 4. User Profile & Habits

### 4.1 Get Profile
- **Endpoint:** `GET /api/v1/users/me`
- **Response Shape (200 OK):**
```json
{
  "user_id": "usr_99a8b1",
  "username": "u/capsule_curator",
  "bio": "Curating architectural silhouettes and minimal palettes.",
  "is_anonymous": true,
  "avatar_gradient": "ocean_drift",
  "likes_count": 1420
}
```

### 4.2 Update Profile Settings
- **Endpoint:** `PUT /api/v1/users/me`
- **Request Body:**
```json
{
  "username": "u/capsule_curator",
  "bio": "Curating architectural silhouettes and minimal palettes.",
  "is_anonymous": true,
  "avatar_gradient": "azure_mist"
}
```
- **Response Shape (200 OK):** Updated `UserProfile` object.

### 4.3 Fit Streak Tracking
Tracks consecutive days of styling activity ("Wear this" confirmation or posting).

- **Endpoint:** `GET /api/v1/users/me/streak`
- **Response Shape (200 OK):**
```json
{
  "count": 5,
  "lastDate": "2026-10-13"
}
```

- **Ping Activity (Wear This / Post Created):**
- **Endpoint:** `POST /api/v1/users/me/streak/ping`
- **Response Shape (200 OK):**
```json
{
  "count": 6,
  "lastDate": "2026-10-14",
  "unlockedBadges": ["streak_5_days"]
}
```

---

## 5. AI Services

### 5.1 Recreate Look
Cross-references a post's garments with the user's digitized wardrobe and identifies matching pieces and wardrobe gaps.

- **Endpoint:** `POST /api/v1/ai/recreate`
- **Request Body:**
```json
{
  "postId": "post-01"
}
```
- **Response Shape (200 OK):**
```json
{
  "postId": "post-01",
  "matched": [
    {
      "itemId": "item_top_01",
      "matchPct": 92
    },
    {
      "itemId": "item_bottom_02",
      "matchPct": 88
    }
  ],
  "missing": [
    "Navy wool tailored overcoat",
    "Minimalist black leather Chelsea boots"
  ]
}
```

---

### 5.2 AI Caption & Vibe Tag Suggestions
Generates 3 contextual stylist caption options and aesthetic tags based on garment pins and image composition.

- **Endpoint:** `POST /api/v1/ai/suggest-captions`
- **Request Body:**
```json
{
  "image": "https://cdn.example.com/uploads/photo.jpg",
  "pins": [
    { "type": "shirt", "note": "Cashmere sweater" },
    { "type": "pants", "note": "Pleated trousers" }
  ]
}
```
- **Response Shape (200 OK):**
```json
{
  "captions": [
    "Understated luxury with relaxed drape and neutral tone balancing.",
    "Architectural layering for chilly mornings in the city.",
    "Proportion play: oversized knit paired with clean straight trousers."
  ],
  "suggestedTags": ["QuietLuxury", "Minimalist", "OldMoney", "Monochrome"]
}
```

---

### 5.3 Rate My Fit (Outfit Analyzer)
Analyzes user mirror selfies, generates holistic Drip Score, evaluates 4 dimensional criteria, and offers actionable styling tips.

- **Endpoint:** `POST /api/v1/ai/rate-outfit`
- **Request Body:**
```json
{
  "image": "https://cdn.example.com/uploads/selfie.jpg",
  "occasion": "casual"
}
```
- **Response Shape (200 OK):**
```json
{
  "total": 8.8,
  "fit": 9.2,
  "color": 8.7,
  "occasion": 8.9,
  "accessories": 7.8,
  "tips": [
    "Clean tonal palette with high visual harmony across navy and light blue.",
    "Try slightly uncuffing the trouser hem for an unbroken vertical line.",
    "A structured leather tote would elevate the casual aesthetic."
  ]
}
```

---

### 5.4 Personal Style DNA
Derives the user's fashion archetype, color harmony palette, and most-worn silhouettes from wardrobe data and logged outfits.

- **Endpoint:** `GET /api/v1/users/me/style-dna`
- **Response Shape (200 OK):**
```json
{
  "archetype": "Quiet Luxury & Architectural",
  "vibes": ["Minimal", "Old money", "Smart casual"],
  "palette": ["#04344C", "#B0EDF9", "#052C40", "#7FD6EA", "#EAFBFE"],
  "signaturePieces": [
    { "type": "Cashmere Overshirt", "wearCount": 18 },
    { "type": "Pleated Wool Trousers", "wearCount": 14 }
  ]
}
```

---

## 6. Summary of Deliverables & Next Steps

1. **Authentication Token Support:** Standardize JWT authentication header in request handlers.
2. **Database Migrations:** Create Supabase tables for `posts`, `pins`, `collections`, `collection_items`, and `user_streaks`.
3. **AI Worker Integration:** Connect Groq / Gemini endpoints for `/ai/recreate`, `/ai/suggest-captions`, and `/ai/rate-outfit`.
4. **Zero-Latency Response:** Ensure average response times under 250ms for cached feed queries.
