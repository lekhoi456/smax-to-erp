import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        listLead: './public/list-lead.html'
      },
      output: {
        manualChunks: {
          vendor: ['svelte']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['svelte']
  }
}); 