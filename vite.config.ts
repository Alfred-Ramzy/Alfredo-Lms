import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase/app') || id.includes('firebase/auth') || id.includes('firebase/firestore') || id.includes('firebase/storage')) return 'firebase'
          if (id.includes('react-dom') || id.includes('react-router-dom') || /node_modules[\\/]+react[\\/]/.test(id)) return 'vendor'
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) return 'query'
          if (id.includes('framer-motion') || id.includes('lucide-react')) return 'ui'
          if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('qrcode.react')) return 'charts'
          return undefined
        },
      },
    },
  },
})