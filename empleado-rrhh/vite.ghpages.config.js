import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Automail-webgen/',
  build: {
    outDir: 'dist-ghpages'
  }
});
