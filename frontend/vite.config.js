import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 
  plugins: [react(),tailwindcss()],
  server: {
    fs: {
      // Prevent Vite from crawling outside the frontend directory
      allow: ['..'],
      deny: ['**/backend/**', '**/node_modules/mongodb/**']
    }
  },
  optimizeDeps: {
    exclude: ['mongodb', 'crypto'] // 👈 tell Vite to ignore these Node.js packages
  }
})
