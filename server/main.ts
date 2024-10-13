import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getViteServer } from './lib/vite/get-vite-server';
import { PORT } from '@const/server';

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
