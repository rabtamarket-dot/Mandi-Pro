
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    // historyApiFallback is not a valid property for Vite's ServerOptions.
    // Vite handles SPA routing by falling back to index.html by default.
  }
});
