import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ mode }) => ({
  preview: {
    host: '127.0.0.1',
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      server: {
        build: {
          staticNodeEnv: true,
        },
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: false,
        concurrency: 5,
      },
      sitemap: {
        enabled: true,
        host: 'https://bdgcafe.com',
      },
    }),
    tailwindcss(),
    mode !== 'production' ? devtools() : null,
    viteReact(),
  ],
}))

export default config
