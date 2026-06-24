import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lms-proxy': {
        target: 'https://lms.psu.ac.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lms-proxy/, '')
      }
    }
  }
});
