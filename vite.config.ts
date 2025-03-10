import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/',
  server: {
    historyApiFallback: true,
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
});