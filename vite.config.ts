import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Zinseszins-Simulation',
        short_name: 'Zinseszins',
        description:
          'Deutscher Zinseszins-Rechner mit Sparplan-, Steuer- und Entnahmesimulation.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'de',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      helpers: path.resolve(__dirname, './helpers'),
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
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-plugin-zoom'],
          // Form libraries
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Icons
          icons: ['lucide-react'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
  },
})
