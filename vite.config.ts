import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 4200,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9200',
        changeOrigin: true,
      },
    },
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

