import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Automail-webgen/demo/',
  envDir: '.',
  define: {
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true')
  },
  build: {
    outDir: 'dist-demo'
  }
});
