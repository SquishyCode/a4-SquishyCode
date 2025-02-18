import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "https://a4-squishycode.onrender.com",
    cors: true,
    historyApiFallback: true,
    allowedHosts: true
  }
});

