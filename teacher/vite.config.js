import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 MUHIM
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://uchqun-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
