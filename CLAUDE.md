# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **bun** as the package manager.

```bash
bun dev          # Start dev server on port 3000
bun run build    # Production build
bun run test     # Run all tests (Vitest)
bun run lint     # ESLint
bun run check    # Prettier write + ESLint fix (auto-formats everything)
```

Run a single test file:

```bash
bunx vitest run src/path/to/file.test.ts
```

## Architecture

**Framework:** TanStack Start (SSR-capable React meta-framework) with TanStack Router file-based routing. The router config lives in `src/router.tsx`; `src/routeTree.gen.ts` is auto-generated — never edit it manually.

**Routing:** Add a file to `src/routes/` and TanStack auto-registers it. The root layout (`src/routes/__root.tsx`) wraps every route via `shellComponent` and renders the persistent `<Header />`. Dynamic segments use `$` notation — e.g. `cafe.$cafeId.tsx` → `/cafe/:cafeId`.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite`. Custom design tokens are defined in `src/styles.css` under `@theme`:

- Colors: `forest`, `moss`, `grove`, `grove-light`, `bark`, `cream`, `forest-light`
- Font: Plus Jakarta Sans (variable), loaded via `@fontsource-variable/plus-jakarta-sans`
- Background color of the app is `bg-cream`; primary text colors are `text-forest` (dark) and `text-bark` (muted)

**Import alias:** Both `@/` and `#/` resolve to `src/`. Prefer `@/`.

**Data layer:** Currently all data is mocked in `src/lib/mock/cafeDetail.ts`. This file defines the core TypeScript interfaces (`CafeData`, `CafeReview`, `RatingsResponse`, etc.) that model the full café + review domain — treat these as the source of truth for data shapes until a real API is wired in.

**Component organisation:** Route-level pages are thin — they pull mock data and compose components. Shared primitives go in `src/components/`; page-specific components are colocated under `src/components/<page-name>/` (e.g. `cafe-detail/`).

**Café Detail page structure** (`/cafe/$cafeId`): two-column layout on desktop — left column holds `CafeTitle`, `ReviewCard`, `RatingsCard`, `Disclaimer`; right sidebar holds `QuickFacts`, `ScoreCard`, `PriceCard`. `RatingsCard` renders a 2-col grid of `RatingSlider` components driven by the `RatingsResponse` type (7 rating dimensions: price, comfort, noise, wifi, meals, ambiance, parking — each with a 3-stop named range and a 0–5 score).

**Prettier config:** no semicolons, single quotes, trailing commas everywhere.
