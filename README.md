# BDGCafé

A bilingual (Indonesian / English) café discovery and review site for Bandung — live at **[bdgcafe.com](https://bdgcafe.com)**.

Browse cafés by location, tag, price, and rating; read honest per-dimension reviews (wifi, vibe, noise, price, meals, atmosphere, parking); and use the **Meet in the Middle** tool to find cafés between several spots.

## Tech stack

- **[TanStack Start](https://tanstack.com/start)** — SSR-capable React meta-framework
- **[TanStack Router](https://tanstack.com/router)** — file-based routing with loaders
- **React 19** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** with custom design tokens
- **[i18next](https://www.i18next.com/)** / react-i18next for localization
- **[Leaflet](https://leafletjs.com/)** for maps
- **[Vitest](https://vitest.dev/)** + React Testing Library for tests
- **[Bun](https://bun.sh/)** as the package manager and production server

## Getting started

This project uses **bun**.

```bash
bun install
bun dev          # dev server on http://localhost:3000
```

The frontend talks to a REST backend. Point it at your API via an env var (defaults to `http://localhost:8080`):

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

## Scripts

```bash
bun dev               # Dev server on port 3000
bun run build         # Production build (SSR + prerender + sitemap)
bun run start         # Serve the production build with the Bun server (server.ts)
bun run test          # Run all tests once
bun run test:watch    # Tests in watch mode
bun run test:coverage # Coverage report (v8)
bun run lint          # ESLint
bun run format        # Prettier check
bun run check         # Prettier write + ESLint fix
```

Run a single test file:

```bash
bunx vitest run src/path/to/file.test.ts
```

## Project structure

```
src/
  routes/              File-based routes
    {-$locale}/        User-facing pages under an optional locale segment
                       (bare path = Indonesian, /en prefix = English)
    telemetry/         Beacon sinks (web vitals, navigation, errors)
    (monitoring)/      Infra endpoints (health, ready, Prometheus metrics)
    __root.tsx         Root layout (header, navbar, footer, middleware)
  components/          Shared primitives + page-scoped folders
                       (cafe-detail/, explore/, meet-in-the-middle/, home/, map/)
  lib/
    api/               REST client wrappers (cafe, search, location, filters)
    telemetry/         Logging, metrics, tracing
    seo.ts, srp.ts     SEO metadata + Search-Result-Page pretty URLs
    explore.ts         Explore search-param (de)serialization
    locale.ts          Locale helpers (useLocale, LocaleLink support)
  i18n/                i18next setup + en/id translation resources
  styles.css           Tailwind theme tokens
  test/                Vitest helpers (renderWithProviders, router mock)
docs/                  Design notes
server.ts              Bun production server (static asset preloading)
```

## Localization

Indonesian is the default and lives at bare paths; English is served under a `/en` prefix. Short UI strings live in `src/i18n/locales/{en,id}/common.json`; long-form page prose (About, Privacy Policy) lives in per-locale React components. Navigate with `<LocaleLink>` so links stay in the active language.

## Contributing

See [`CLAUDE.md`](./CLAUDE.md) for the in-depth architecture guide, testing conventions, and code-style notes. Prettier is configured for no semicolons, single quotes, and trailing commas — run `bun run check` before committing.

## License

Copyright © 2026 Muhammad Raditya.

This project is licensed under the **[Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**.
See [`LICENSE`](./LICENSE) for the full legal text.

You are free to **fork, use, and adapt** this code **for personal, non-commercial purposes**, provided you give appropriate credit and link back to this repository. **Commercial use is not permitted.**
