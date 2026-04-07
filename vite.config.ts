import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Use absolute path to avoid special character in CWD
const ROOT = path.resolve('c:\\Users\\6\\Downloads\\qianrushi1')

export default defineConfig({
  root: ROOT,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
