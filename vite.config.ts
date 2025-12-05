import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '', '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the Gemini SDK and your code
      // Support both GEMINI_API_KEY and API_KEY for flexibility
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'framer-motion', 'recharts'],
            ai: ['@google/genai'],
            utils: ['clsx', 'date-fns', 'tailwind-merge'],
          },
        },
      },
    },
  };
});