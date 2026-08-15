import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist/public',
    emptyOutDir: false,
    minify: mode === 'production',
    sourcemap: mode !== 'production',
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/admin/client.tsx'),
      output: {
        entryFileNames: 'client.js',
        assetFileNames: 'client[extname]',
      },
    },
  },
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
}));
