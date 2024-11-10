import { NestFactory } from '@nestjs/core';
import { AppModule } from '@server/app/app.module';
import { getViteServer } from './lib/vite/get-vite-server';
import { PORT } from '@const/server';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const vite = await getViteServer();

  app.use(vite.middlewares);

  await app.listen(PORT, () => {
    console.log(`✅Server listening to port : ${PORT}`);
    console.log(`🏃Current Running Env :: ${process.env.NODE_ENV}`);
  });
}
bootstrap();
