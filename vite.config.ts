import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

// base '/clinico/' solo en build — el dev server sigue funcionando en /
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/clinico/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'GESAP — Portal Clínico',
        short_name: 'GESAP Clínico',
        description: 'Sistema Hospitalario de Guatemala — Portal Clínico',
        theme_color: '#0A2647',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/clinico/',
        scope: '/clinico/',
        lang: 'es',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
    proxy: {
      "/gesap/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/api-ws": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy) => {
          proxy.on("error", (err: NodeJS.ErrnoException) => {
            if (err.code !== "ECONNRESET") console.error("[api-ws proxy]", err);
          });
        },
      },
    },
  },
}))
