import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist/public',
    minify: mode === 'production',
    sourcemap: mode !== 'production',
    rollupOptions: {
      input: resolve(__dirname, 'src/client.tsx'),
      output: {
        entryFileNames: 'client.js',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
