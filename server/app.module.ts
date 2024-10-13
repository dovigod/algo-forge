/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViteModule } from './vite/vite.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ViteModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
    serveRoot: 'public'
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
