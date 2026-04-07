import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const projectRoot = new URL('.', import.meta.url).pathname

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
