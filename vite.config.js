import { defineConfig } from 'vite'
export default defineConfig({
  root: 'frontend',
  build: { outDir: '../dist' },
  server: {
    port: 5175, // Cambia al puerto que estás utilizando
  },
})
