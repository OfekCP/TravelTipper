import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default {
  // other config options...
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/api/travel': 'http://localhost:3001',
      
    },
  },
};