# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project:** BDGCafé ([bdgcafe.com](https://bdgcafe.com)) — a bilingual (Indonesian/English) café discovery and review
site for Bandung. Users explore cafés by location/tag/price/rating, read honest per-dimension reviews (wifi, vibe,
noise, price…), and use a "meet in the middle" tool to find cafés between several spots.

## Commands

This project uses **bun** as the package manager.

```bash
bun dev               # Start dev server on port 3000
bun run build         # Production build (SSR + prerender + sitemap)
bun run start         # Serve the production build via the Bun server (server.ts)
#bun run test          # Run all tests once (Vitest)
#bun run test:watch    # Vitest in watch mode
#bun run test:coverage # Vitest with a v8 coverage report
bun run lint          # ESLint
bun run format        # Prettier check (no writes)
bun run check         # Prettier write + ESLint fix (auto-formats everything)
```

Run a single test file:

```bash
#bunx vitest run src/path/to/file.test.ts
```

## Testing

Currently in feat/test branch, not merged to main yet.

**Stack:** Vitest 4 + React Testing Library + jsdom. Config lives in a **standalone `vitest.config.ts`** (intentionally
_not_ the app `vite.config.ts` — that runs `tanstackStart()`, which boots SSR/prerender/sitemap and breaks jsdom tests).
Tests are colocated next to source as `*.test.ts(x)`. Global setup (`src/test/setup.ts`) registers jest-dom matchers and
auto-cleanup.

**Helpers (`src/test/`):**

- `@/test/utils` — `renderWithProviders(ui, { locale })` wraps the tree in a fresh i18next instance via `createI18n` (
  default locale `'en'`, so assertions read in English). Also re-exports everything from `@testing-library/react` plus
  `userEvent`. Import test utilities from here.
- `@/test/router` — router mock surface: `routerOverrides`, the `mockNavigate` spy, `resetRouter()`,
  `setMockPathname(path)`.

**Router in tests:** any unit that renders `<Link>`/`<LocaleLink>` or calls `useNavigate`/`useLocale` (which reads
`useRouterState`) needs the router mocked — booting a real router is avoided. Add at the top of the test file:

```ts
vi.mock('@tanstack/react-router', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-router')>()
  const {routerOverrides} = await import('@/test/router')
  return {...actual, ...routerOverrides}
})
beforeEach(resetRouter) // pathname defaults to '/en' → locale 'en'; setMockPathname('/') for 'id'
```

Hook tests that assert navigation can read call args off `mockNavigate` (or use a local `vi.hoisted` spy). Pure-logic
util tests need none of this.

**Coverage** excludes leaflet/map components, server functions (`createServerFn`), telemetry, middleware, and route
modules — these aren't unit-tested. The `fetch` wrappers in `src/lib/api/*` are also out of scope (only their pure
helpers, e.g. `cleanExploreSearch`, are tested). Focus unit tests on pure logic: `src/lib/` helpers (`explore`, `srp`,
`seo`, `seoTemplate`, `locale`) and presentational components.

## Architecture

**Framework:** TanStack Start (SSR-capable React meta-framework) with TanStack Router file-based routing. The router
config lives in `src/router.tsx`; `src/routeTree.gen.ts` is auto-generated — never edit it manually.

**Import alias:** `@/` resolves to `src/` (configured in `tsconfig.json` `paths`). Use it for all non-relative imports.

### Routing

Add a file to `src/routes/` and TanStack auto-registers it. Dynamic segments use `$` notation (`cafe.$cafeId.tsx` →
`/cafe/:cafeId`). The root layout (`src/routes/__root.tsx`) wraps every route via `shellComponent`, mounts the
request-logging middleware, and renders the persistent chrome (`Header`, `Navbar`, `Footer`, telemetry client). There
are three route groups:

- **`{-$locale}/`** — the user-facing pages, under an **optional locale segment**. Bare paths are Indonesian (the
  default); English is served under a visible `/en` prefix. The layout `{-$locale}/route.tsx` redirects the redundant
  `/id` prefix to the bare path and 404s any non-locale prefix. Pages: `index` (home), `explore.index` + `explore.$` (
  search results / SRP), `cafe.$cafeId` (detail), `meet-in-the-middle`, `about`, `privacy-policy`.
- **`telemetry/`** — POST beacon sinks for real-user data: `vitals`, `nav`, `error`. No UI.
- **`(monitoring)/`** — pathless group of infra endpoints: `health`, `ready`, `metrics` (Prometheus scrape).

### Internationalization (i18n)

Locale config lives in `src/i18n/` (`SUPPORTED_LOCALES = ['id', 'en']`, default `'id'`). `createI18n(locale)` builds a *
*fresh i18next instance per SSR request** (and per locale on the client) so request state never leaks between concurrent
renders. Translation resources are bundled (`locales/{en,id}/common.json`), so init is synchronous.

- **Short UI strings** (nav labels, SEO title/description, card labels) → i18next (`useTranslation` / `i18n.t`).
- **Long-form page prose** (About, Privacy Policy) → per-locale React components (`EN.tsx` / `ID.tsx`), **not** i18n
  keys.

Locale helpers are in `src/lib/locale.ts`: `useLocale()` (reads active locale from the router), `localeFromPathname`,
`localeParam`, `localePrefix`, `toggleLocalePath`, `dateLocale`. **Always navigate with `<LocaleLink>`** (
`src/components/LocaleLink.tsx`) instead of the raw `<Link>` — it injects the active locale into the `{-$locale}` param
so links stay in the current language. `to` must be an optional-locale route path (e.g. `"/{-$locale}/explore"`).

### Data layer

Data comes from a **real REST backend**, reached through thin `fetch` wrappers in `src/lib/api/`:

- `api/index.ts` — `API_BASE` (from `VITE_API_BASE_URL`, default `http://localhost:8080`) and `langHeaders(lang)`, which
  sends the active locale to the backend via the `Accept-Language` header for content negotiation.
- `api/cafe.ts` — café detail + review (`getCafe`, `getCafeReview`); defines `CafeData`, `CafeReview`,
  `RatingsResponse`, etc.
- `api/search.ts` — listing/search (`searchCafes`, `quickSearch`, `getFeaturedCafes`, `getNearbyCafes`) + the pure
  `cleanExploreSearch` helper.
- `api/location.ts` — location hierarchy (`getLocation`).
- `api/filters.ts` — the filter taxonomy from `/v1/filters` (tags, rating categories, price tiers).

These API interfaces are the **source of truth for data shapes**; shared cross-domain types live in `src/lib/type.ts` (
`Location`, `ApiResponse<T>`, …). Route `loader`s fetch on the server and pass typed data to thin page components.

### SEO & SRP (pretty URLs)

SEO is centralized in `src/lib/seo.ts` (canonical/`localizedPath`, OG image, JSON-LD builders, breadcrumb crumbs) and
`src/lib/seoTemplate.ts` (per-page title/description templates). Each user-facing route's `head()` reads its loader data
and returns `seoHead(seo)`.

**SRP (Search Result Page) pretty URLs** are handled by `src/lib/srp.ts`: `/explore/<slugs>` composes up to four filter
axes (`location × tag × price × rating`) into one canonical SEO URL, with a fixed segment order (out-of-order paths
redirect). The backend's `/v1/filters` metadata **is** the slug registry — slugs are never hand-maintained here. See
`docs/srp-filter-taxonomy.md` for the taxonomy and combination rules. `src/lib/explore.ts` owns the explore
search-param (de)serialization and validation that bridges the URL and the search API.

### Observability

Telemetry lives in `src/lib/telemetry/` (`logger`, `metrics` (Prometheus via `prom-client`), `tracing`, `otel`,
`context`, `webVitals`) and the request-logging middleware in `src/lib/middleware.ts` (continues/starts a distributed
trace, records HTTP metrics, skips noisy infra paths). The `(monitoring)` and `telemetry` routes are the sinks/scrape
endpoints. This stack is a **dormant, self-hosted seam**: endpoints are unauthenticated by design (gate at the
router/proxy level), and OTel is prepared but not active. Excluded from test coverage.

### Production server

`server.ts` is a Bun production server: it preloads small static assets into memory (with ETag + gzip), serves
large/filtered ones on-demand, and falls back to the TanStack Start handler for everything else. Run it with
`bun run start` after `bun run build`. Behavior is tuned via `ASSET_PRELOAD_*` env vars (documented at the top of the
file).

### Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Custom design tokens are defined in `src/styles.css` under `@theme`:

- Colors: `forest`, `moss`, `grove`, `grove-light`, `bark`, `cream`, `forest-light`
- Font: Plus Jakarta Sans (variable), loaded via `@fontsource-variable/plus-jakarta-sans`
- Background of the app is `bg-cream`; primary text colors are `text-forest` (dark) and `text-bark` (muted)

Compose conditional/merged class lists with `cn()` from `src/lib/cn.ts` (clsx + tailwind-merge). Prefer the standard
Tailwind scale; use arbitrary values only when a design calls for a value no standard step fits.

### Component organisation

Route-level pages are thin — they fetch via loaders and compose components. Shared primitives go in `src/components/`;
page-specific components are colocated under `src/components/<page-name>/` (e.g. `cafe-detail/`, `explore/`,
`meet-in-the-middle/`, `home/`, `map/`), most with a barrel `index.ts`.

**Café Detail page** (`/cafe/$cafeId`): two-column layout on desktop — left column holds `CafeTitle`, `ReviewCard`,
`RatingsCard`, `Disclaimer`; right sidebar holds `QuickFacts`, `ScoreCard`, `PriceCard`. `RatingsCard` renders a grid of
`RatingSlider` components driven by `RatingsResponse` (rating dimensions `price-rank`, `vibe`, `noise`, `wifi`, `meals`,
`atmosphere`, `parking` — each a `RatingEntry` with named ranges and a 0–5 score).

**Prettier config:** no semicolons, single quotes, trailing commas everywhere.
