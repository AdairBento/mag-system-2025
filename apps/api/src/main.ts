import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);

  const log = new Logger('Bootstrap');
  log.log(`API on http://localhost:${port}`);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
