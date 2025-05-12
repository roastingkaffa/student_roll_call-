import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:3000',
      '/teachers': 'http://localhost:3000',
      '/students': 'http://localhost:3000',
      '/courses': 'http://localhost:3000',
    },
    // ⬇️ 新增這個設定
    historyApiFallback: true
  }
})

