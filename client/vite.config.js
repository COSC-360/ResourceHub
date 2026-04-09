import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
      },
      "/assets": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
