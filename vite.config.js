import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base relativa: la app funciona igual en raíz (dev/LAN) que bajo una
  // subruta como GitHub Pages (seakerop.github.io/fromzerotohero/).
  base: './',
  plugins: [react()],
  server: { port: 5177, host: true },
  test: { environment: 'node' },
})
