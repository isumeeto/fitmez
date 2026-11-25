# PROMPT 03 — Premium Redesign: New Colors, Light + Dark Themes, Thick Glass, Animation System, Performance Fixes, and 17 New Features

Read `FRONTEND_CONTEXT.md` first for product background, API contracts and rules.

This prompt is applied **on top of the existing project** (built from Prompts 01 and 02). It **supersedes** Prompt 02's colors, glass spec and nav behavior. Keep all existing routes and working logic. Do not change the real backend contracts in `lib/api.ts`.

**Target: mobile only** (390×844 design size; on wider screens the app sits in a centered phone-width container).

**Work in the phases listed in section 14, and run `npm run build` at the end of each phase.** Fix errors before moving on.

---

## 1. Why this pass exists (problems to fix)

1. The app looks dull, generic and "vibe coded": same card grid everywhere, no hierarchy, no personality, generic text, default look.
2. Animations are almost missing.
3. There is perceptible latency (slow navigation, laggy nav highlight, jank).
4. The bars need a **thick glass** look.
5. Colors change to the new palette below, with both a dark and a light theme.
6. Add 17 features that make the app feel premium and alive.

**Design principles (apply everywhere):** restraint (one accent color, used with purpose), clear hierarchy (one hero element per screen), image-first, consistent 8pt spacing, purposeful motion (every animation explains or rewards an action), and a confident short microcopy voice. If a screen looks like a default template, redesign it.

---

## 2. Color system (replaces all previous colors)

Brand palette (from the owner's reference): **Pistel Blue `#04344C`** and **Sky Blue `#B0EDF9`**. Everything else is derived. Define all tokens as CSS variables in `app/globals.css`, mapped into Tailwind. **No hardcoded hex values in components.** Remove every trace of the old orchid and jet-black colors.

### 2.1 Dark theme ("Deep Sea") — `[data-theme="dark"]`
```css
--bg:            #021A26;
--bg-2:          #03212F;
--surface:       #052C40;
--surface-2:     #04344C;                 /* brand navy, elevated */
--border:        rgba(176,237,249,0.12);
--border-strong: rgba(176,237,249,0.22);
--text:          #EAFBFE;
--text-muted:    #8FB8C4;
--text-subtle:   #5F8796;
--accent:        #B0EDF9;                 /* sky */
--accent-soft:   #D6F6FC;
--accent-deep:   #7FD6EA;                 /* pressed */
--accent-tint:   rgba(176,237,249,0.14);  /* selected backgrounds */
--accent-line:   rgba(176,237,249,0.40);  /* selected borders, focus ring */
--accent-glow:   rgba(176,237,249,0.30);
--on-accent:     #04344C;                 /* text/icons on sky fills */
--btn-bg:        #B0EDF9;  --btn-fg: #04344C;
--bubble:        #B0EDF9;  --on-bubble: #04344C;
--glass-rgb:     5, 44, 64;
--grad-brand:    linear-gradient(135deg, #B0EDF9, #4FB8D0);
```

### 2.2 Light theme ("Sky") — `[data-theme="light"]`
```css
--bg:            #F0FBFE;
--bg-2:          #E3F6FB;
--surface:       #FFFFFF;
--surface-2:     #DDF3F9;
--border:        rgba(4,52,76,0.10);
--border-strong: rgba(4,52,76,0.18);
--text:          #04344C;
--text-muted:    #4E7283;
--text-subtle:   #7A9AA8;
--accent:        #04344C;                 /* navy is the interactive color in light */
--accent-soft:   #0B5C7D;
--accent-deep:   #021F2D;
--accent-tint:   rgba(4,52,76,0.08);
--accent-line:   rgba(4,52,76,0.35);
--accent-glow:   rgba(176,237,249,0.60);
--on-accent:     #B0EDF9;
--btn-bg:        #04344C;  --btn-fg: #B0EDF9;
--bubble:        #B0EDF9;  --on-bubble: #04344C;   /* + 1px border rgba(4,52,76,0.15) */
--glass-rgb:     255, 255, 255;
--grad-brand:    linear-gradient(135deg, #04344C, #0B5C7D);
```

### 2.3 Shared tokens (both themes)
```css
--like:    #FF7A8A;   /* heart only (the one warm accent) */
--danger:  #FF6B7A;
--success: #5EE0A0;
```

### 2.4 Where the accent goes (use it sparingly, about 10% of any screen)
- **Use for:** active nav bubble, primary buttons (`--btn-bg` / `--btn-fg`), selected chips and segmented controls (`--accent-tint` bg + `--accent` text + `--accent-line` border), links, focus rings, star ratings, streak flame, progress and score gauges, small AI moments (thinking orb, shimmer sheen), gradient border on the AI explanation card and the Style DNA card.
- **Heart/like uses `--like`** only.
- **Do not use for:** page backgrounds, body text, card fills, every border, or large filled areas. Hierarchy comes from surface shade, spacing and type weight.
- **Contrast:** all text must meet 4.5:1 in both themes. Text on accent fills always uses `--on-accent`.

### 2.5 Theme mechanism
- Setting with three options: **System / Dark / Light**, default **System**. Stored in `localStorage` key `dripcheck_theme`.
- Apply via `data-theme` on `<html>`. Add a tiny inline script in `app/layout.tsx` `<head>` that sets it **before first paint** (no flash).
- Update `color-scheme` and `<meta name="theme-color">` (`#021A26` dark, `#F0FBFE` light) when the theme changes.
- Toggle lives in `/profile/edit` (segmented control with sliding pill). Both themes must look finished and be tested on every screen.

---

## 3. Thick glass (top bar, bottom nav, floating controls, sheets, popovers)

One reusable `GlassSurface` component/class used everywhere.

```css
.glass {
  position: relative;
  background: linear-gradient(135deg,
    rgba(var(--glass-rgb), 0.62),
    rgba(var(--glass-rgb), 0.42));
  backdrop-filter: blur(36px) saturate(170%) brightness(1.04);
  -webkit-backdrop-filter: blur(36px) saturate(170%) brightness(1.04);
  border-radius: 9999px;                 /* sheets/popovers use 28px */
  box-shadow:
    0 18px 40px -12px rgba(2, 26, 38, 0.45),         /* depth */
    inset 0 1px 0 rgba(255,255,255,0.35),            /* top specular edge */
    inset 0 -1px 0 rgba(0,0,0,0.10),                 /* bottom edge */
    inset 0 0 24px rgba(255,255,255,0.05);           /* inner glow */
}
/* 1px gradient edge: bright top-left fading to transparent bottom-right */
.glass::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.18));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
/* subtle frosted grain (inline SVG feTurbulence data URI, ~5% opacity, mix-blend-mode: overlay) */
.glass::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: .05; mix-blend-mode: overlay; /* background-image: grain data URI */ }

@supports not (backdrop-filter: blur(1px)) { .glass { background: rgba(var(--glass-rgb), 0.94); } }
@media (prefers-reduced-transparency: reduce) { .glass { backdrop-filter: none; background: rgba(var(--glass-rgb), 0.97); } }
```

Rules:
- It must read as **thick, frosted glass**: content beneath is a soft colored haze, never readable.
- In light theme use a slightly stronger depth shadow tinted with `#04344C` at low opacity.
- **Performance:** only the top bar, bottom nav, sheets and popovers use `backdrop-filter`. Never put it on cards or list items, and never nest it. Give the two bars their own compositing layer (`transform: translateZ(0)`).
- Keep the floating pill shape: 12px from the screen edges, respecting safe areas. Pages need enough top and bottom padding so no content is hidden.

---

## 4. Performance and latency fixes (mandatory)

1. **Remove every artificial delay** (`setTimeout`/sleep) from `lib/social.ts` and all mocks. Mocks must resolve immediately. Show skeletons only for genuinely pending work.
2. **Nav is optimistic:** the active tab and bubble update on `pointerdown`/click **immediately**, not after the route changes. Use `next/link` with prefetch and `startTransition` for navigation. Keep a local `activeIndex` state that syncs to the pathname afterwards.
3. **No auth flash:** mirror the session in a cookie (`dripcheck_session`) and add `middleware.ts` so unauthenticated visitors are redirected to `/login` (or `/onboarding` on first visit) **before render**. Show the splash while hydrating. (Auth is still mocked; keep it behind `lib/auth.ts`.)
4. **Images:** reserve space with `aspect-ratio` from data (every post has `aspectRatio`), use `next/image` with `sizes`, `loading="lazy"` (first 4 cards `priority`), `decoding="async"`, and a dominant-color/blur placeholder. Zero layout shift.
5. **Masonry without JS measuring:** distribute posts into two columns at the **data level** by balancing cumulative `1/aspectRatio` heights, render as two flex columns. Use `content-visibility: auto` with `contain-intrinsic-size` on cards. Paginate 12 per page with an `IntersectionObserver` sentinel (infinite scroll).
6. **Rendering:** `React.memo` on `PostCard`, `ItemCard`, `Chip`; per-card local like state (not feed-level); stable callbacks; no inline object/array props on hot paths.
7. **Animate only `transform` and `opacity`.** Never animate width/height/top/left/blur in loops. Use `will-change` only while animating.
8. **Code splitting:** `next/dynamic` for onboarding, Style DNA share export, confetti/sparkles, rate-fit scanner, collection sheet.
9. **Fonts:** `next/font` with `display: "swap"`, latin subset, only needed weights.
10. **Scroll:** passive listeners; use `IntersectionObserver` or `requestAnimationFrame` for header behavior; no layout reads in scroll handlers.
11. **Bundle:** import lucide icons individually. Allowed new dependencies: `motion` (animation) and `html-to-image` (share card export, dynamically imported). Nothing else.
12. **Targets (check with Lighthouse mobile on the mock build):** interactions respond in under 100ms, CLS under 0.05, smooth 60fps scrolling and animations on mid-range phones.

### Mock images
Do not hotlink random photos. Create `lib/mock/images.ts` with `getMockImage(i, aspectRatio)`:
- If `NEXT_PUBLIC_MOCK_IMAGES=local`, return `/mock/outfits/01.jpg … NN.jpg` (the owner will drop real fashion photos in `public/mock/outfits/`).
- Otherwise (default) return a tasteful generated SVG placeholder (data URI): themed gradient tile in the brand colors with a faint clothing silhouette (shirt/hanger), in the requested aspect ratio. Vary gradients so the feed looks rich, not repetitive.
Every mock post, item and collection uses this helper.

---

## 5. Animation system

Add `motion` (import from `motion/react`). Wrap the app in `<MotionConfig reducedMotion="user">`. Create `lib/motion.ts` with shared tokens:

```ts
export const dur = { fast: 0.15, base: 0.25, slow: 0.4 };
export const ease = { out: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1] };
export const spring = {
  snappy: { type: "spring", stiffness: 500, damping: 34 },
  soft:   { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 420, damping: 22 },
};
```

Create reusable pieces: `Pressable` (scale 0.97 on press with `spring.snappy`), `FadeUp` (opacity + translateY 8px entrance), `Stagger` (40ms stagger, max 8 items), `Skeleton` (shimmer), `SheetBottom` (drag-to-dismiss glass sheet with spring and backdrop dim), `Toast` (spring slide-up, auto-dismiss).

### Animation catalog (all must exist)
- **Launch:** splash (see feature 5).
- **Route transitions:** use the **View Transitions API** (`document.startViewTransition`) with a small helper `navigate(href)` that falls back to a 200ms fade + 8px slide when unsupported. Shared element: feed card image → post detail image (`view-transition-name: post-<id>` on both). Direction-aware slide between tabs (based on tab index delta), 220ms, with opacity.
- **Every tappable:** press scale feedback (`Pressable`).
- **Feed:** staggered entrance on first load only; new items from infinite scroll fade in.
- **Like:** heart scale-bounce plus 8-particle radial burst (`--like`), with haptic.
- **Segmented controls:** sliding pill with shared layout animation. **Chips:** pop (scale 0.95 → 1) on select.
- **Bottom nav:** sliding bubble (see section 6).
- **Top bar:** hides on scroll down (after 80px), returns on scroll up (translateY animation, 250ms).
- **Sheets/popovers:** spring in, drag to dismiss, backdrop fade.
- **Numbers:** count-up on stats and scores (600ms ease-out).
- **AI moments:** pulsing "thinking" orb (accent gradient) with rotating microcopy: "Checking your colors…", "Matching your fits…", "Picking shoes…".
- **Success moments:** light sparkle burst on post published, look saved, badge unlocked.
- **Skeletons:** shimmer sweep, theme-aware.
- All animations respect `prefers-reduced-motion` (replace motion with simple fades).

---

## 6. App shell

### 6.1 Top bar (thick glass pill)
- Left: wordmark `APP_NAME` in the **display font**, bold. Right: circular gradient-orb avatar (feature 16) with a thin 1.5px `--accent` ring, tapping opens `/profile`.
- Collapses/hides on scroll as described.

### 6.2 Bottom nav (thick glass pill)
Same five tabs and routes as before: Home `/`, Search `/search`, Create `/create`, Stylist (shirt) `/stylist`, Profile `/profile`. **No icon is permanently highlighted** (including `+`).
- One round **bubble** (48px, `--bubble` fill, `--accent-glow` shadow, subtle inner highlight; in light theme add a 1px `rgba(4,52,76,0.15)` border) **slides to the tapped icon instantly** with `spring.bouncy`, slightly stretching in the direction of travel (scaleX 1.15 during travel).
- Active icon uses `--on-bubble`, stroke 2.25; inactive `--text-muted`, stroke 1.75. Icons only, with `aria-label` and `aria-current`.
- Tapping `+` slides the bubble then opens `/create`; the nav hides on `/create`, `/onboarding`, `/login` and full-screen flows; on return, the bubble is on the previous tab.
- Tap feedback: icon scale 0.9 plus light haptic.

### 6.3 Haptics
`lib/haptics.ts` exposing `haptic.light()`, `.medium()`, `.success()` using `navigator.vibrate` (guard for support; iOS Safari ignores it, so no-op safely). Use on nav taps, like, long-press activation, pull-to-refresh trigger, success moments, badge unlock. Add a **Haptics** on/off toggle in `/profile/edit` (`dripcheck_haptics`).

---

## 7. Typography and visual identity

- **Display font:** `Bricolage Grotesque` (600/700/800) for the wordmark, big headings, score numbers and stats. **UI font:** `Plus Jakarta Sans` (400/500/600/700). Tighten heading tracking (`-0.02em`).
- Type scale: 32 / 24 / 20 / 16 / 14 / 12. One clear heading per screen.
- Icons: lucide, stroke 1.75, sizes 20/24. Active states use heavier stroke, not a different icon set.
- Cards: 22px radius, no heavy borders (hairline `--border` max), soft shadow in light theme only.
- **Microcopy voice:** confident, short, a little playful. Examples: empty wardrobe → "Your closet's empty. Let's fix that."; no results → "Nothing yet. Try a different vibe."; loading → "Styling you…"; error → "That didn't land. Try again."
- **Illustrations:** 4 small inline SVG line illustrations (hanger, camera, mirror, empty box) in `components/illustrations/`, theme-aware, used in empty states.
- **Rhythm in the feed:** about every 9th post is a wide **editorial card** spanning both columns (larger image, caption overlay) to break the template look.

---

## 8. Screen redesign notes (fix the "dull" pages)

- **Home:** greeting header ("Good evening, u/name"), then the **Today's Fit hero** (feature 1), then vibe chips (For you, All, Streetwear, Minimal, Formal, Casual, Date, Party, Office), then the masonry feed with editorial cards.
- **Search:** big glass search field, visual trending tiles and color swatch filters (feature 8), recent searches, live results.
- **Create:** 3-step flow with an animated step indicator (Photo → Tag → Details), glass bottom action bar (features 11, 12).
- **Stylist:** hero header with closet stats (feature 10); segmented control **Wardrobe | Get outfit | Rate fit**; occasion cards with gradient art and mood label; result screen with the animated reveal (feature 4).
- **Profile:** orb avatar, `u/username`, stats, **Style DNA card** (feature 7), streak and badges (feature 13), tabs **Posts | Collections**.
- **Login:** slowly drifting gradient mesh background in brand colors, glass card, wordmark in display font. Same functionality as before.
- **Post detail:** shared-element hero image, action row (like, save, share, recreate), tag pins, similar looks.

---

## 9. The 17 features

All backend-dependent behavior is **mocked** behind typed service functions in `lib/social.ts` and `lib/ai.ts` (create this), each marked `// TODO(backend)`. Persist local state in `localStorage` with try/catch and SSR guards. No made-up URLs.

**1. Today's Fit hero (Home).** Card with date greeting, a collage of 3–4 outfit pieces, a one-line "why it works", occasion chips (casual, office, date, party), buttons **Wear this** and **Shuffle** (animated swap). Uses `recommendOutfit(userId, occasion)` (real API, mock mode supported). Cache per day per occasion in `sessionStorage`. If the wardrobe has fewer than 3 items, show an invite to add pieces. Tapping opens `/stylist/result/[id]`. "Wear this" counts for the streak (feature 13).

**2. Recreate this look.** Button on post detail and in the long-press menu. Opens a glass sheet with the AI thinking animation, then shows the original post beside "your version" with matched wardrobe pieces and a match % per piece, plus a "missing pieces" list (names only, no shopping). Mock `recreateLook(postId)`.

**3. Double-tap like + long-press quick actions.** Double-tap an image to like (heart burst at the tap point). Long-press (350ms, haptic) lifts the card (scale 1.03, dims the rest) and shows a glass popover: Like, Save to collection, Recreate, Share, Report. Provide a visible "…" button as the accessible alternative.

**4. Animated AI result reveal.** On `/stylist/result/[id]`, after data arrives: pieces fly in one by one (120ms apart), then the explanation types out like a stylist talking (about 40 chars/second), with "Why it works" chips (e.g. Color harmony, Occasion match). Total under 2.5s, **tap to skip**. Real latency shows the thinking orb, with no fake delay.

**5. Splash and onboarding.** Splash: logo mark scale/fade with a soft glow, max about 1.2s, never blocks longer than hydration. First launch only (`dripcheck_onboarded`): `/onboarding` with 3 swipeable slides (motion drag): "Your closet, styled by AI" → "Get inspired. Stay anonymous." → "Pick your vibes" (multi-select chips: Streetwear, Minimal, Old money, Y2K, Korean casual, Techwear, Smart casual, Athleisure, Vintage, Gorpcore, Preppy, Edgy; minimum 3). Save to `dripcheck_vibes` and use them to boost matching posts under a **For you** chip. Skip button available. Order: splash → onboarding (first time) → login → home.

**6. Shared-element transitions and tab animations.** As described in section 5.

**7. Style DNA card (Profile).** Gradient-bordered card showing top 3 vibes, a color palette bar built from wardrobe item colors, most-worn pieces (mock), and a style archetype label derived from vibes (e.g. "Quiet Luxury"). Animated count-up and palette sweep. **Share** button exports the card as an image (`html-to-image`, dynamically imported on tap; use `navigator.share({files})` with a download fallback), with a small app-name watermark.

**8. Visual search (Search).** Trending styles as **image tiles** (cover with gradient overlay and label) in a 2-column grid, plus a horizontal **color swatch row** (black, white, beige, navy, olive, brown, red, pink, blue, grey, green, purple). Swatches multi-select and filter results by each post's `colors`; combine with text and style filters. Animated result updates.

**9. Collections.** Bookmark on posts opens a glass sheet: pick a collection or **New collection** (name input). Profile tab **Collections** shows a grid with 2×2 cover collages; tapping opens `/profile/collections/[id]` (masonry of its posts, rename/delete). Persist locally.

**10. Closet stats (Wardrobe).** Stat strip (pieces, colors, most common type), an animated SVG **color palette ring** (donut, sweep-in), and horizontal category rails (shirt, pants, shoes, jacket, accessory) with counts. Computed client-side from items.

**11. Tag clothes on photo (Create).** After choosing a photo, tap it to drop up to 6 pins (spring pop-in). Each pin opens a small sheet: type (shirt/pants/shoes/jacket/accessory), optional note or brand, optional link to a wardrobe item. Store pins as normalized `{x, y, type, note, itemId?}`. On post detail, a **Show tags** toggle reveals pins that expand on tap.

**12. AI caption suggestions (Create).** "Suggest caption" button produces 3 caption chips that type in, plus suggested style tags. Tap to apply. Mock `suggestCaptions(image, pins)`.

**13. Streaks and badges.** Fit streak = consecutive days the user taps **Wear this** or posts. Flame chip on the Home hero and Profile. Badges grid with locked silhouettes and unlock animation plus toast: First post, 5-day streak, 10 pieces added, First recreate, Style DNA shared, Early adopter. Local storage (`dripcheck_streak`), definitions in `lib/badges.ts`, use local dates.

**14. Pull-to-refresh.** On Home, Search (trending) and Wardrobe. Custom indicator (small hanger/shirt icon with elastic rotate), threshold 70px, rubber-band easing, haptic on trigger, only when scrolled to the top. Set `overscroll-behavior-y: contain` to avoid the browser's native refresh.

**15. Haptics.** As in section 6.3.

**16. Gradient-orb avatars.** `Avatar` renders deterministic orbs from the username hash: 2–3 blurred radial gradients in blue/teal/violet tones within the brand range, plus faint grain, clipped to a circle. `/profile/edit` has **Shuffle** and 8 presets. On the profile page the orb drifts slowly (12s transform loop). No image files needed.

**17. Rate my fit (UI-only).** New route `/stylist/rate` and the third segment in the Stylist hub. Flow: pick or take a mirror selfie, choose an occasion, tap **Analyze**, then a **scanning animation** (scan line sweeping the photo with corner brackets), then the result: an animated gauge counting up to a **Drip Score** (e.g. 8.7/10), four sub-score bars (Fit, Color matching, Occasion, Accessories), and 2–3 suggestion cards (e.g. "Try tucking the shirt for a sharper line"). **Share score** reuses the share-image logic. Mock `rateOutfit(image, occasion)` returns deterministic scores in the 6.5–9.5 range. Clearly mark as mock.

---

## 10. Data and types (add to `lib/types.ts`)

```ts
export interface Pin { x: number; y: number; type: string; note?: string; itemId?: string }
export interface Post {
  id: string; image: string; aspectRatio: number; caption: string;
  tags: string[]; vibes: string[]; colors: string[];
  author: { username: string; orbSeed: string };
  likes: number; likedByMe: boolean; savedByMe: boolean;
  pins?: Pin[]; featured?: boolean; createdAt: string;
}
export interface Collection { id: string; name: string; postIds: string[]; createdAt: string }
export interface Streak { count: number; lastDate: string }
export interface Badge { id: string; label: string; description: string; unlockedAt?: string }
export interface MatchResult { postId: string; matched: { itemId: string; matchPct: number }[]; missing: string[] }
export interface FitScore { total: number; fit: number; color: number; occasion: number; accessories: number; tips: string[] }
```

Make at least 40 varied mock posts (varied aspect ratios, vibes, colors, authors) so the feed feels full.

---

## 11. New and changed files

```
app/
├── (auth)/login/page.tsx                  # restyled
├── onboarding/page.tsx                    # new
├── (main)/
│   ├── profile/collections/[id]/page.tsx  # new
│   └── stylist/rate/page.tsx              # new
middleware.ts                              # new (auth redirect, no flash)
components/
├── GlassSurface.tsx, BottomNav.tsx, TopBar.tsx        # rebuilt
├── Pressable.tsx, FadeUp.tsx, Stagger.tsx, SheetBottom.tsx, Toast.tsx, Skeleton.tsx
├── TodaysFit.tsx, StyleDNACard.tsx, StreakChip.tsx, BadgeGrid.tsx
├── PostCard.tsx, EditorialCard.tsx, PostActionsMenu.tsx, HeartBurst.tsx
├── ColorSwatchRow.tsx, StyleTile.tsx, PaletteRing.tsx, ClosetStats.tsx
├── PinLayer.tsx, CaptionSuggestions.tsx, PullToRefresh.tsx
├── ScoreGauge.tsx, ScanOverlay.tsx, ThinkingOrb.tsx, Avatar.tsx
└── illustrations/ (Hanger, Camera, Mirror, EmptyBox)
lib/
├── motion.ts, haptics.ts, theme.ts, badges.ts
├── ai.ts          # mock: recreateLook, suggestCaptions, rateOutfit
├── social.ts      # mock (no delays)
└── mock/images.ts, mock/posts.ts
BACKEND_NEEDS.md                           # new, see below
```

---

## 12. BACKEND_NEEDS.md (deliverable)

Create `BACKEND_NEEDS.md` at the repo root for the backend partner. For every `// TODO(backend)` function, list: the feature, suggested endpoint, method, request body, response shape (matching the types above). Cover at least: feed (cursor pagination), search with filters (query, vibes, colors), posts (create with pins), likes, collections (CRUD), profile and anonymous username, streaks, recreate look, caption suggestions, rate outfit, style DNA. Keep it concise and practical. This is documentation only; do not add real calls.

---

## 13. Accessibility

- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Every gesture (double-tap, long-press, swipe, pull-to-refresh) has a visible button alternative.
- Touch targets at least 44×44px, visible focus rings (`--accent-line`), `alt` text and `aria-label`s, correct `aria-current` on nav.
- Contrast 4.5:1 for text in both themes.

---

## 14. Build order (do in phases; run `npm run build` after each)

1. **Foundation:** tokens for both themes, theme switching with no flash, fonts, `GlassSurface` (thick glass), `motion` setup and `lib/motion.ts`, haptics, remove all artificial delays, mock image helper and 40 mock posts, middleware auth redirect.
2. **Shell:** new top bar and bottom nav (instant sliding bubble), route and tab transitions (View Transitions + fallback), sheet/toast/skeleton/pressable components.
3. **Screen redesign:** Home, Search, Create, Stylist, Profile, Login, Post detail per section 8, with illustrations and microcopy.
4. **Features 1–17** per section 9, in numeric order.
5. **QA and docs:** accessibility pass, performance pass (section 4 targets), write `BACKEND_NEEDS.md`, update `FRONTEND_CONTEXT.md` design section to the new palette.

---

## 15. Acceptance checklist

- [ ] No orchid or jet-black leftovers; no hardcoded hex in components; both themes (System/Dark/Light) work on every screen, with no flash on load.
- [ ] Bars look like thick frosted glass in both themes (blur, specular edge, grain), and scrolling stays smooth.
- [ ] Bottom nav: no permanently highlighted icon; the bubble moves instantly on tap and slides with a springy stretch; correct after back navigation.
- [ ] No artificial delays anywhere; no auth flash; no layout shift in the feed; images lazy with placeholders.
- [ ] Route transitions work, including the shared-element card → post hero (with fallback).
- [ ] Every item in the animation catalog (section 5) exists and respects reduced motion.
- [ ] Features 1–17 all work in mock mode and are reachable by tapping through the UI.
- [ ] New routes exist: `/onboarding`, `/stylist/rate`, `/profile/collections/[id]`.
- [ ] Editorial cards appear in the feed; custom empty states and microcopy are used.
- [ ] `BACKEND_NEEDS.md` exists and is accurate.
- [ ] Mobile only, no horizontal scroll, no TypeScript errors, `npm run build` passes, Lighthouse mobile shows CLS under 0.05.

When done, reply with a short summary: what was built, what is mocked, assumptions made, and anything you could not finish.
