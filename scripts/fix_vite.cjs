const fs = require('fs');
const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
`;
fs.writeFileSync('C:/Users/19821/Desktop/????app/vite.config.ts', content, 'utf-8');
console.log('vite.config.ts written ok');
