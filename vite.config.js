// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  server: {
    // proxy any request starting with /profile to your FastAPI
    proxy: {
      '/profile': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
       // if you also want to browse the OpenAPI JSON
      '/openapi.json': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
