import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 MUHIM
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          // Handle connection errors (ECONNREFUSED, etc.)
          proxy.on('error', (err, req, res) => {
            console.error('Vite proxy error:', req.url, err.code || err.message);
            
            // Only handle if response hasn't been sent
            if (res && !res.headersSent) {
              // For media proxy requests, return transparent PNG
              if (req.url?.includes('/api/media/proxy/')) {
                const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
                res.writeHead(500, {
                  'Content-Type': 'image/png',
                  'Cache-Control': 'no-cache',
                });
                res.end(transparentPng);
              } else {
                // For other API requests, return JSON error
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({ 
                  error: 'Service unavailable', 
                  message: 'Backend server is not running. Please start the backend server on port 5000.',
                  code: err.code || 'ECONNREFUSED'
                }));
              }
            }
          });
          
        },
      },
      '/uploads': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
