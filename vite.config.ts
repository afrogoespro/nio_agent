import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite only serves the SPA; /api routes are Vercel functions.
    // Proxy to production so "npm run dev" can build plans locally.
    // Override with VITE_API_PROXY=http://localhost:3000 when using `vercel dev`.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'https://outreach-app-mu.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
