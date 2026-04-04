import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: '/',
    proxy: {
      '/api': {
        target: 'https://buslink-back-end.onrender.com',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        signup: 'signup.html',
        dashboard: 'dashboard.html',
      },
    },
  },
});
