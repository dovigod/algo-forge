import { Injectable } from '@nestjs/common';
import { getViteServer } from '@server/lib/vite/get-vite-server';
import type { ViteDevServer } from 'vite';

@Injectable()
export class RenderService {
  private server: ViteDevServer;
  private ssrModule: Record<string, any>;

  async getServer() {
    if (!this.server) {
      this.server = await getViteServer();
    }
    return this.server;
  }

  async getModule() {
    if (!this.ssrModule) {
      const server = await this.getServer();
      this.ssrModule = await server.ssrLoadModule(
        '/server/lib/react/render.tsx',
      );
    }
    return this.ssrModule;
  }
}
