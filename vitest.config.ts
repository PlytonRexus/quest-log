import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    environmentMatchGlobs: [
      // DB and ingestion tests need Node environment (no window object)
      // so sql.js WASM loading works correctly
      ['src/db/**/*.test.ts', 'node'],
      ['src/ingestion/**/*.test.ts', 'node'],
      ['src/ai/**/*.test.ts', 'node'],
      ['src/viz/__tests__/graphMapper.test.ts', 'node'],
      ['src/viz/__tests__/Starfield.test.ts', 'node'],
      ['src/game/**/*.test.ts', 'node'],
      ['src/canvas/__tests__/canvasStore.test.ts', 'node'],
    ],
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
