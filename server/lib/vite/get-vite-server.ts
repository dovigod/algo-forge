/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CLIENT_BASE } from '@const/client';
import { resolveClientPath } from '@server/utils/resolve-path';
import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';

const PATH_TO_STATIC_SERVE = '../../client/public';
let viteDevServer: ViteDevServer;

/**
 * get vite server
 * @param opts options
 * @param opts.force create vite server forcibly
 * @returns instance of vite server
 */
export async function getViteServer({ force } = { force: false }) {
  if (!viteDevServer || force) {
    viteDevServer = await createServer({
      publicDir: resolveClientPath(PATH_TO_STATIC_SERVE),
      server: {
        // @ts-ignore
        middlewareMode: 'ssr',
      },
      appType: 'custom',
      base: CLIENT_BASE,
    });
  }

  return viteDevServer;
}
