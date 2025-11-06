import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      'helpers': path.resolve(__dirname, './helpers'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunks
          'radix-ui': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          // Chart library
          'charts': ['recharts'],
          // Form libraries
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Icons
          'icons': ['lucide-react'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
  },
})
