import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      server: {
        build: {
          staticNodeEnv: true,
        },
      },
    }),
    tailwindcss(),
    mode !== 'production' ? devtools() : null,
    viteReact(),
  ],
}))

export default config
