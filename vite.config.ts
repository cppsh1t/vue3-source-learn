import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  base: '/vue3-source-learn',
  esbuild: {
    target: 'es2022'
  }
});