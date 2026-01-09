import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { requestIdMiddleware } from './common/request-id.middleware';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { ApiResponseInterceptor } from './common/api-response.interceptor';

type CorsOrigin = string | RegExp;

function parsePort(value: string | undefined, fallback = 3001): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseCorsOrigins(value?: string): CorsOrigin[] | '*' {
  if (!value) return ['http://localhost:3000'];

  const v = value.trim();
  if (v === '*') return '*';

  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // use pino logger (already provided by your LoggerModule)
  app.useLogger(app.get(Logger));

  // request id middleware first
  app.use(requestIdMiddleware);

  const port = parsePort(process.env.PORT, 3001);
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  await app.listen(port, '0.0.0.0');

  // log via Nest logger (consistent)
  const log = new NestLogger('Bootstrap');
  log.log(`API listening on http://localhost:${port}`);
  log.log(
    `CORS origins: ${corsOrigins === '*' ? '*' : corsOrigins.join(', ')}`,
  );
}

bootstrap();
