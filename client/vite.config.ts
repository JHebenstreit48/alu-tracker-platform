import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || ''),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
