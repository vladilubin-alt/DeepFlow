import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@architect': path.resolve(__dirname, 'stages/03_Architect'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
