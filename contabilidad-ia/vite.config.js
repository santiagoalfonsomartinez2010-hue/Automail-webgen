import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para la demo del Empleado de Contabilidad IA.
// No hay backend: todos los datos son simulados en el propio frontend.
// La base apunta a la ruta de GitHub Pages cuando se despliega.
export default defineConfig({
  plugins: [react()],
  base: '/Automail-webgen/',
  server: {
    port: 3000
  }
});
