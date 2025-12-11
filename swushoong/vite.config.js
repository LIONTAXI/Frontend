import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    // SockJS 내부에서 global을 참조할 때 window 객체로 대체하도록 강제
    global: 'window', 
  },
  
})
