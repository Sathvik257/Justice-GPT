import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // The bundled Indian law dataset is intentionally large; split it and the
    // vendor libraries into their own long-lived cacheable chunks.
    chunkSizeWarningLimit: 2600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/lawsAndActs')) return 'law-dataset';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});