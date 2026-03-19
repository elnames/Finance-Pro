import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilitar CORS para el frontend en el puerto 3010
  await app.listen(3011, '0.0.0.0');
  console.log(`Backend running on: http://localhost:3011 (mapped to 0.0.0.0)`);
}
bootstrap();
