import svgrPlugin from 'vite-plugin-svgr';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Flask 서버 주소
        changeOrigin: true,
        configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              console.log('Proxying request to:', proxyReq.path);
            });
          },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000, // in kilobytes
  },
  plugins: [svgrPlugin()], // 플러그인 추가
});
