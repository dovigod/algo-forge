/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * vite-tsconfig-path requires application type ="module"
 *
 */

export default defineConfig({
  publicDir: resolve(__dirname, './client', 'public'),
  plugins: [react(), tsconfigPaths()],

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

  /**
   * vite keeps on complaining that assets in "client/**" cant be resolved
   * https://github.com/vitejs/vite/issues/15374
   */
  server: {
    preTransformRequests: false,
  },

  ssr: {
    noExternal: ['styled-components'],
  },
});
