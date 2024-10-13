/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  publicDir: resolve(__dirname, './client', 'public'),
  plugins: [react()],
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    alias: {
      // @ts-ignore
      '@client': fileURLToPath(new URL('client', import.meta.url)),
      // @ts-ignore
      '@server': fileURLToPath(new URL('server', import.meta.url)),
      // @ts-ignore
      '@const': fileURLToPath(new URL('const', import.meta.url)),
    },
  },
});
