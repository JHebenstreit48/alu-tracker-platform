import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all requests starting with `/api` to the backend server
      '/api': {
        target: 'http://localhost:5000', // Backend server
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // If your backend uses HTTPS, set this to true
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: rewrite paths if needed
      },
    },
  },
});