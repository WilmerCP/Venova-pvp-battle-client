import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    root: 'renderer/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',          // important for Electron file:// loading
  build: {
    outDir: '../dist/',
    emptyOutDir: true,
  },
})