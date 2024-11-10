/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { sitemap } from '@client/sitemap';
import { RenderService } from '@server/render/render.service';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(private readonly renderService: RenderService) { }

  public async getPage(url: string, res: Response) {
    const module = await this.renderService.getModule();
    module.render(url, res);
  }

  public getSitemap() {
    return sitemap
  }
}


