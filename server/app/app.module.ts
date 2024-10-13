/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViteModule } from '@server/vite/vite.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

console.log(join(__dirname, '..', '..', 'public'))
@Module({
  imports: [ViteModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '..', 'public'),
    serveRoot: 'public',
    // exclude: ['*.css', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.json', '*.mp4', '*.webm'],
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
