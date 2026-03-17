import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
  },
  resolve: {
    alias: {
      '@app': '/src/app',
      '@features': '/src/features',
      '@shared': '/src/shared',
      '@services': '/src/services',
    },
  },
});

