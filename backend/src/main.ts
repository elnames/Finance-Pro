import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  // Fail fast: JWT_SECRET must be set before any token can be signed or verified
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  }

  const app = await NestFactory.create(AppModule);

  // A05 - Security Misconfiguration: HTTP security headers
  app.use(helmet());

  // A05 - Security Misconfiguration: Restrict CORS to known frontend origin
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  // A03 - Injection: Global validation pipe strips unknown fields and validates types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Strip fields not in DTO
      forbidNonWhitelisted: true, // Reject requests with unknown fields
      transform: true,       // Auto-transform types (string -> number, etc.)
    }),
  );

  await app.listen(3011, '0.0.0.0');
}
bootstrap();
