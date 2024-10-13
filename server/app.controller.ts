/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/:slug')
  public getPage(@Param('slug') slug: string, @Res() response: Response) {
    return this.appService.getPage(slug, response)
  }

  @Get('/sitemap.xml')
  public getSiteMap(@Res() res: Response) {
    res.set({ 'Content-Type': 'text/xml' });
    res.send(this.appService.getSitemap())
  }
}
