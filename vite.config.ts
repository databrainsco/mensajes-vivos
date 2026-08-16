import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE ?? '/mensajes-vivos/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'packages/**/*'],
      manifest: {
        name: 'Mensajes Vivos',
        short_name: 'Mensajes Vivos',
        description: 'Mira. Reconoce. Escucha el México antiguo.',
        theme_color: '#171512',
        background_color: '#171512',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es-MX',
        start_url: '.',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /packages\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'cultural-packages' },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
