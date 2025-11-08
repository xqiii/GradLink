import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 读取环境变量
  const frontendPort = parseInt(process.env.VITE_FRONTEND_PORT || '5173', 10)
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5050'
  
  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true
        }
      }
    }
  }
})
