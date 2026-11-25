# DripCheck AI — Frontend Context

> Reference file for the AI agent (Antigravity) working on the **frontend**.
> Read this fully before writing any code. The backend is built by a separate person, so **never change API contracts** — build against them exactly as written below.

---

## 1. What We're Building

**DripCheck AI** is an AI personal stylist that turns a user's real wardrobe into a smart digital closet.

**Core flow:**
Upload clothes → AI tags them → User picks an occasion / asks "What should I wear?" → AI recommends an outfit from their own wardrobe and explains why.

**Pitch:** DripCheck AI turns your real wardrobe into an intelligent digital closet that helps you dress better every day.

---

## 2. Scope (MVP v1 only)

**In scope:**
- Upload clothing items (image)
- View all items in the wardrobe
- Delete an item
- Choose an occasion and get an outfit recommendation
- Show the outfit + the explanation of why it works
- Rate an outfit (1–5)

**Out of scope — do NOT build or suggest:**
Weather integration, smart shopping, Drip Score / Outfit Analyzer, social features, local-first storage, Personal Style DNA, outfit history.

**Rule: No feature creep. Stick to the MVP.**

---

## 3. Tech Stack (Frontend)

| Item | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Approach | Mobile-first, responsive |

Backend (for context only, not our job): FastAPI on Render, Supabase (DB + Storage + Auth), Groq (outfit logic), Gemini/GPT-4o mini (vision tagging).

---

## 4. Pages & Routes

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Landing page + "Start" button |
| Upload | `/upload` | Upload clothing images |
| Wardrobe | `/wardrobe` | View all items (grid) |
| Recommend | `/recommend` | Choose occasion, get outfit |
| Result | `/result/[id]` | Show outfit + explanation + rating |

---

## 5. Folder Structure

```
frontend/
├── app/
│   ├── page.tsx
│   ├── upload/page.tsx
│   ├── wardrobe/page.tsx
│   ├── recommend/page.tsx
│   └── result/[id]/page.tsx
├── components/
│   ├── UploadCard.tsx
│   ├── ItemCard.tsx
│   └── OutfitCard.tsx
├── lib/
│   └── api.ts
└── package.json
```

Keep this structure. Add new components under `components/` only when needed.

---

## 6. Environment Variables

`.env.local`
```
NEXT_PUBLIC_API_URL=https://dripcheck-api.onrender.com
```

Always read the base URL from `process.env.NEXT_PUBLIC_API_URL`. Never hardcode it.

---

## 7. API Contracts (Source of Truth)

Base URL: `NEXT_PUBLIC_API_URL`

### 7.1 `POST /items` — Upload a clothing item
Request: `multipart/form-data`
- `user_id`: string
- `image`: file

Response:
```json
{
  "id": "uuid",
  "image_url": "https://...",
  "type": "shirt",
  "color": "white",
  "pattern": "solid",
  "fit": "oversized",
  "style": "casual",
  "season": "summer",
  "occasion": "casual"
}
```

### 7.2 `GET /items?user_id=xxx` — Get all items for a user
Response:
```json
{
  "items": [
    { "id": "uuid", "type": "shirt", "color": "blue", "image_url": "..." }
  ]
}
```

### 7.3 `DELETE /items/{id}` — Delete an item
Response: `{ "success": true }`

### 7.4 `POST /recommend` — Get an outfit recommendation
Request:
```json
{ "user_id": "xxx", "occasion": "office" }
```
Response:
```json
{
  "outfit_id": "uuid",
  "items": [
    { "id": "uuid", "type": "shirt", "color": "blue" },
    { "id": "uuid", "type": "pants", "color": "cream" },
    { "id": "uuid", "type": "shoes", "color": "white" }
  ],
  "explanation": "The blue linen shirt pairs well with cream chinos..."
}
```

### 7.5 `POST /feedback` — Rate an outfit
Request:
```json
{ "user_id": "xxx", "outfit_id": "uuid", "rating": 4 }
```
Response: `{ "success": true }`

> Note: `/recommend` items may not include `image_url`. If the Result page needs images, match `items[].id` against the wardrobe items already fetched via `GET /items`, or confirm with the backend partner before assuming the field exists.

---

## 8. Data Types & Allowed Values

```ts
export type ClothingType = "shirt" | "pants" | "shoes" | "jacket" | "accessory";
export type Pattern = "solid" | "stripes" | "checks" | "floral";
export type Fit = "slim" | "regular" | "oversized";
export type Style = "casual" | "formal" | "streetwear" | "minimal";
export type Season = "summer" | "winter" | "all-season";
export type Occasion = "casual" | "office" | "date" | "party";

export interface Item {
  id: string;
  image_url: string;
  type: ClothingType | string;
  color: string;
  pattern?: Pattern | string;
  fit?: Fit | string;
  style?: Style | string;
  season?: Season | string;
  occasion?: Occasion | string;
}

export interface RecommendResponse {
  outfit_id: string;
  items: Pick<Item, "id" | "type" | "color">[];
  explanation: string;
}
```

AI-generated tags can come back outside these exact values, so the UI must **never crash on an unexpected string** — render it as-is.

Occasion picker options: `casual`, `office`, `date`, `party`.

---

## 9. API Client (`lib/api.ts`)

All backend calls go through this one file. Pages and components never call `fetch` directly.

Functions to expose:
- `uploadItem(userId, file)` → `POST /items`
- `getItems(userId)` → `GET /items?user_id=`
- `deleteItem(id)` → `DELETE /items/{id}`
- `recommendOutfit(userId, occasion)` → `POST /recommend`
- `sendFeedback(userId, outfitId, rating)` → `POST /feedback`

Requirements:
- Typed with the interfaces above
- Throws a readable error on non-2xx responses
- Don't set `Content-Type` manually for `multipart/form-data` (let the browser set the boundary)

---

## 10. User Identity

Backend supports **Supabase Auth or an anonymous ID**. For v1, default to an **anonymous `user_id`**:
- Generate a UUID on first visit and persist it in `localStorage` under `dripcheck_user_id`
- Send it as `user_id` on every request
- Wrap in a small helper (e.g. `getUserId()` in `lib/`), guard for SSR (`typeof window !== "undefined"`)

> Confirm with the backend partner before switching to real auth.

---

## 11. UX States (Required on every screen)

Every screen that talks to the backend must handle:
- **Loading** — skeletons/spinners (AI calls can take several seconds: tagging on upload, recommendation generation)
- **Empty** — e.g. empty wardrobe → friendly prompt to go to `/upload`
- **Error** — clear message + retry
- **Success** — confirmation where it makes sense

Specific cases:
- **Upload:** image preview before sending, progress/"AI is analyzing your clothes…" state, show returned tags after success, support multiple uploads
- **Recommend:** if the wardrobe is empty or too small to build an outfit, guide the user to upload more instead of failing silently
- **Result:** outfit items shown together, explanation text, 1–5 star rating that calls `/feedback`

---

## 12. Design System

> **TO BE FILLED IN** — the frontend lead will describe the design (colors, fonts, vibe, layout, component look). Until this section is filled, use clean, neutral, mobile-first Tailwind defaults and do not invent a heavy visual identity.

- Brand name: **DripCheck AI**
- Vibe: _TBD_
- Colors: _TBD_
- Typography: _TBD_
- Corner radius / shadows / spacing: _TBD_
- Page-by-page design notes: _TBD_

---

## 13. Coding Rules for the Agent

1. TypeScript everywhere; no `any` unless unavoidable.
2. Tailwind for styling; avoid custom CSS files unless necessary.
3. Mobile-first; test layouts at ~375px width first.
4. Use Next.js `<Image>` for clothing images when possible (configure the Supabase Storage domain in `next.config`).
5. Use client components (`"use client"`) only where interactivity/state is needed.
6. Small, reusable components; keep pages thin.
7. Accessible: alt text, button labels, keyboard focus.
8. Don't add libraries without a good reason; keep dependencies minimal.
9. Never change API shapes. If something is missing from the backend, flag it instead of guessing.
10. Don't build anything listed under "Out of scope".

---

## 14. Team & Workflow

| Person | Role | Owns |
|---|---|---|
| A (me) | Frontend & Product Lead | Next.js, UI/UX, user testing, product decisions |
| B | Backend & AI Lead | FastAPI, Supabase, AI prompts, deployment |

- Every PR needs 1 review.
- Every task needs a GitHub issue.
- Update `ARCHITECTURE.md` when architecture changes.

**Roadmap:** Week 1 upload + store clothes → Week 2 AI tags clothes → Week 3 outfit recommendation → Week 4 polish + launch.
