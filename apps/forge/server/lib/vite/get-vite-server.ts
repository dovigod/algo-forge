/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CLIENT_BASE } from '@const/client';
import { PATH_TO_STATIC_SERVE } from '@const/server';
import { resolveClientPath } from '@server/utils/resolve-path';
import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';

let viteDevServer: ViteDevServer;

/**
 * vite server, use as middleware to handle client codes
 */
export async function getViteServer({ force } = { force: false }) {
  if (!viteDevServer || force) {
    viteDevServer = await createServer({
      publicDir: resolveClientPath(PATH_TO_STATIC_SERVE),
      server: {
        // @ts-ignore - wtf?
        middlewareMode: 'ssr',
      },
      appType: 'custom',
      base: CLIENT_BASE,
    });
  }

  return viteDevServer;
}
