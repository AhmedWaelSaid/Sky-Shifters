import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-icons', 'lucide-react', 'react-select'],
        },
      },
    },
  },
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com https://api.mapbox.com blob:",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
        "img-src 'self' data: https://*.mapbox.com https://*.avs.io https://pics.avs.io;",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://api.stripe.com https://sky-shifters.duckdns.org https://chatbot-sky-shifters.duckdns.org https://api.amadeus.com https://infird.com https://overbridgenet.com https://www.google-analytics.com",
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com"
      ].join('; ')
    },
  },
})
