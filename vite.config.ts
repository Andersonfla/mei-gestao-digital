
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // PWA optimizations
    target: 'es2015',
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    // Terser options for better PWA optimization
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } : undefined,
  },
  // Service worker and manifest handling
  publicDir: 'public',
  // PWA specific optimizations
  define: {
    __PWA_VERSION__: JSON.stringify(new Date().toISOString()),
  },
}));
