import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'python/**/*', // Copies all Python files in the python folder
          dest: 'python' // Puts them in build/python after build
        }
      ]
    })
  ],
  build: {
    outDir: 'build', // ✅ Output directory for the build
    assetsDir: 'assets', // ✅ Ensure assets are stored in 'assets' folder
    emptyOutDir: true, // ✅ Clears previous builds before building again
    rollupOptions: {
      output: {
        manualChunks: undefined // ✅ Keeps everything bundled properly
      }
    }
  },
  base: './' // ✅ Make all asset paths relative to index.html
})
