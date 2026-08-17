import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
const sha = (process.env.VITE_GIT_SHA ?? process.env.GITHUB_SHA ?? '').slice(0, 7)
const builtAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
const appVersion = sha ? `v${pkg.version} · ${sha}` : `v${pkg.version} · ${builtAt}`

const base = process.env.VITE_BASE ?? '/mensajes-vivos/'

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    {
      name: 'html-app-version',
      transformIndexHtml(html) {
        return html.replace(
          '<title>Mensajes Vivos</title>',
          `<meta name="app-version" content="${appVersion}" />\n    <title>Mensajes Vivos</title>`,
        )
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/*.svg'],
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
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,svg,jpg,jpeg,png,webp,woff2,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /\/index\.html$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /packages\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'cultural-packages' },
          },
          {
            urlPattern: /^https:\/\/huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'hf-models' },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'wasm-runtime' },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['onnxruntime-node'],
  },
  worker: { format: 'es' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
