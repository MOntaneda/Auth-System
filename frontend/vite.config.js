import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <-- Nuevo import

export default defineConfig({
  plugins: [react(), tailwindcss()], // <-- Añadido aquí
});