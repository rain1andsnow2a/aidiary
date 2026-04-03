import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // 生产环境禁用 source map，防止源码泄露
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://118.194.234.63:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://118.194.234.63:8000',
        changeOrigin: true,
      },
    },
  },
})
