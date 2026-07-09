import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/wq-dashboard/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
})
