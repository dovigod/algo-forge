import { Injectable } from '@nestjs/common';
import { getViteServer } from './get-vite-server';
import type { ViteDevServer } from 'vite';

export const BASE = '/';
export const PRODUCTION = process.env.NODE_ENV === 'production';
export const PORT = 3001;

@Injectable()
export class ViteService {
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
      this.ssrModule = await server.ssrLoadModule('/src/vite/render.tsx');
    }

    console.log(this.ssrModule);
    return this.ssrModule;
  }
}
