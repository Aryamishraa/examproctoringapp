import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During local dev, all /api/* calls are proxied to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output to dist/ inside the frontend folder
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
