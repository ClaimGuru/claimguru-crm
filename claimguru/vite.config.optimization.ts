/**
 * Vite Optimization Configuration
 * Addresses bundle size and performance optimization
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Bundle analyzer
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'vendor-data': ['@tanstack/react-query', '@tanstack/react-table'],
          'vendor-utils': ['date-fns', 'lodash.debounce', 'clsx'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['@googlemaps/js-api-loader'],
          'vendor-payment': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // AI and PDF chunks
          'ai-services': ['@google/generative-ai'],
          'pdf-services': ['jspdf', 'jspdf-autotable', 'pdf-parse'],
          
          // Monitoring
          'monitoring': ['@sentry/react', '@sentry/vite-plugin'],
          
          // Security services
          'security': [
            './src/services/security/authenticationService',
            './src/services/security/authorizationService',
            './src/services/security/dataProtectionService',
            './src/services/security/inputValidationService',
            './src/services/security/apiSecurityService',
          ],
        },
        
        // Asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk'
          return `assets/js/[name]-[hash].js`
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          
          if (/woff|woff2/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          
          return `assets/[name]-[hash][extname]`
        },
      },
    },
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Source maps for production debugging (optional)
    sourcemap: false,
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    exclude: ['@google/generative-ai'],
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
  },
})
