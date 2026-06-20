import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias to resolve architect stage JS files easily
      '@architect': '/stages/03_Architect',
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
