import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@pages": resolve(__dirname, "src/pages"),
      "@components": resolve(__dirname, "src/components"),
      "@css": resolve(__dirname, "src/css"),
    },
  },
});
