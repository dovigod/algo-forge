/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { sitemap } from '@client/sitemap';
import { ViteService } from './vite/vite.service';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(private readonly viteService: ViteService) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getPage(url: string, res: Response) {
    const module = await this.viteService.getModule();
    module.render(url, res);
  }

  getSitemap() {
    return sitemap
  }
}


