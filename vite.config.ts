import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages: https://soyee-1469.github.io/tomatok_translate/
export default defineConfig({
  base: '/tomatok_translate/',
  plugins: [react()],
})
