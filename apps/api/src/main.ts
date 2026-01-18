import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Configurar Validation Pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('MAG Locação API')
    .setDescription('Sistema de Gestão de Locação de Veículos')
    .setVersion('1.0')
    .addTag('health', 'Health Check')
    .addTag('drivers', 'Gerenciamento de Motoristas')
    .addTag('clients', 'Gerenciamento de Clientes')
    .addTag('vehicles', 'Gerenciamento de Veículos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`✅ API listening on http://localhost:${port}`);
  console.log(
    `🌐 CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`,
  );
  console.log(`📚 Swagger docs: http://localhost:${port}/api`);
}

bootstrap();
