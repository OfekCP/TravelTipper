import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default {
  // other config options...
  server: {
    proxy: {
      '/auth': 'https://traveltipper.onrender.com',
      '/api/travel': 'https://traveltipper.onrender.com',
      
    },
  },
};