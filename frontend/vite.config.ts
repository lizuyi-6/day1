import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // Temporarily disabled
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vue-flow/core',
      '@vue-flow/background',
      '@vue-flow/controls',
      '@vue-flow/minimap',
      'lucide-vue-next'
    ]
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
    fs: {
      strict: false,
      allow: ['..']
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})
