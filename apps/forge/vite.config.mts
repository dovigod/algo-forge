/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import path from 'path';

export default defineConfig({
  publicDir: resolve(__dirname, './client', './public'),
  plugins: [
    // nodePolyfills({
    //   protocolImports: true, // e.g) node:stream <- node:
    //   include: ['stream'],
    //   overrides: {
    //     stream: path.resolve(__dirname, './_polyfills/stream.js'),
    //   },
    // }),
    react(),
    tsconfigPaths(),
  ],
  ssr: {
    //fucked-up
    // external: ['@internal/styled-components'],
  },
  build: {
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: './client/entry-client.tsx',
    },
    target: 'esNext',
    commonjsOptions: {
      strictRequires: false,
    },
  },

  resolve: {
    alias: {
      // @ts-ignore
      '@client': fileURLToPath(new URL('./client', import.meta.url)),
      // @ts-ignore
      '@server': fileURLToPath(new URL('./server', import.meta.url)),
      // @ts-ignore
      '@const': fileURLToPath(new URL('./const', import.meta.url)),
    },
  },
  define: {
    // module: '{}'
  },
  /**
   * vite keeps on complaining that assets in "client/**" cant be resolved
   * https://github.com/vitejs/vite/issues/15374
   */
  server: {
    preTransformRequests: false,
  },
});
