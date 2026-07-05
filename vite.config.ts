import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
  server: {
    proxy: {
      '/api/ai': {
        target: 'https://tokenhub.tencentmaas.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
      '/api/fetch': {
        target: 'https://api.allorigins.win/raw?url=',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fetch\//, ''),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    },
  },
})