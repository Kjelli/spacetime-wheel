// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'babel-plugin-react-compiler'; // or the specific Vite plugin
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [reactCompiler],
      },
    }),
    tailwindcss(),
  ],
  server: {
    host: true,       // listen on all network interfaces
    port: 5173,       // optional, default is 5173
  },
});