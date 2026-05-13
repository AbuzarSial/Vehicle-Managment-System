import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Same-origin /api in dev avoids browser CORS when the API returns 5xx without CORS headers.
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
