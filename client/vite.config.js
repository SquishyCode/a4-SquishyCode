import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "https://a4-squishy-code-api.vercel.app/",
    cors: true,
    historyApiFallback: true,  // Add this line
  }
});

