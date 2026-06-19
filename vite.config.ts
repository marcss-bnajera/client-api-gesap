import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// base '/clinico/' solo en build — el dev server sigue funcionando en /
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/clinico/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
    proxy: {
      "/gesap/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Socket.IO en /api-ws (path distinto de /auditor-ws para coexistir en un solo dominio)
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
