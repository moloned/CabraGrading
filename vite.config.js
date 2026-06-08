import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CabraGrading/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        studyGuide: resolve(rootDir, 'study-guide.html'),
        adultKyuGuide: resolve(rootDir, 'kyu-study-guide.html')
      }
    }
  }
})
