import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para la demo del Empleado de Contabilidad IA.
// No hay backend: todos los datos son simulados en el propio frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
