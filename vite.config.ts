import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    open:true,
    proxy:{
      "/api":{
        //localhost말고 쌤한테 요청보내기
        target:"http://192.168.0.107:9000",
        changeOrigin:true
      },
      "/upload":{
        target:"http://192.168.0.107:9000",
        changeOrigin:true
      }
    }
  }
})