import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Standalone test config — intentionally does NOT import the app vite.config.ts,
// whose tanstackStart() plugin boots SSR/prerender/sitemap and breaks jsdom tests.
// We only need the React plugin plus Vite 8's native tsconfig path resolution.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // resolves "@/..." from tsconfig compilerOptions.paths
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    clearMocks: true,
    restoreMocks: true, // auto-restores vi.spyOn (e.g. Math.random) between tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/routeTree.gen.ts',
        'src/router.tsx',
        'src/routes/**',
        'src/components/map/**',
        'src/components/**/*MapView*.tsx',
        'src/components/cafe-detail/MapPreview.tsx',
        'src/components/explore/LocationHero.tsx',
        'src/lib/telemetry/**',
        'src/lib/middleware.ts',
        'src/lib/helper.ts',
        'src/**/index.ts',
        'src/**/*.d.ts',
      ],
    },
  },
})
