import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default {
  // other config options...
  server: {
    proxy: {
      '/auth': `${import.meta.env.VITE_API_URL}`,
      '/api/travel':  `${import.meta.env.VITE_API_URL}`,
      
    },
  },
};