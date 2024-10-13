import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getViteServer } from './vite/get-vite-server';

export const BASE = '/';
export const PRODUCTION = process.env.NODE_ENV === 'production';
export const PORT = 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const vite = await getViteServer();

  app.use(vite.middlewares);

  await app.listen(PORT, () => {
    console.log(`✅Server listening to port : ${PORT}`);
    console.log(`🏃Current Running Env :: ${process.env.NODE_ENV}`);
  });
}
bootstrap();
