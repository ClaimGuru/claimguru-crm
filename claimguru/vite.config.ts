
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically
      }
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for production debugging
    sourcemap: false,
    
    // Minification
    minify: 'esbuild',
    
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  
  // Development optimizations
  server: {
    fs: {
      allow: ['..'],
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ]
  }
})
