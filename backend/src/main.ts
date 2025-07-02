import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Autorise le front (localhost:5173) à accéder à l'API
  app.enableCors({
    origin: ['http://localhost:5173'], // ou ['*'] pour tout autoriser (déconseillé en prod)
  });

  await app.listen(3000);
}
void bootstrap();
