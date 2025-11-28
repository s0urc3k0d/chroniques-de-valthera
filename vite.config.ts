import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 3002,
    host: '0.0.0.0',
    allowedHosts: ['valthera.sourcekod.fr', 'www.valthera.sourcekod.fr', 'localhost'],
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
