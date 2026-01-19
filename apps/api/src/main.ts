import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.log('\n' + '='.repeat(80));
        console.log('VALIDATION ERROR DETECTED');
        console.log('='.repeat(80));
        console.log('Raw errors:', JSON.stringify(errors, null, 2));
        console.log('='.repeat(80) + '\n');

        const messages = errors
          .map((error) => {
            const constraints = error.constraints
              ? Object.values(error.constraints)
              : ['Unknown error'];
            return constraints;
          })
          .flat();

        return new BadRequestException({
          message: messages,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MAG Locacao API')
    .setDescription('Sistema de Gestao de Locacao de Veiculos')
    .setVersion('1.0')
    .addTag('health', 'Health Check')
    .addTag('drivers', 'Gerenciamento de Motoristas')
    .addTag('clients', 'Gerenciamento de Clientes')
    .addTag('vehicles', 'Gerenciamento de Veiculos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('API listening on http://localhost:' + port);
  console.log(
    'CORS origins: ' + (process.env.CORS_ORIGIN || 'http://localhost:3000'),
  );
  console.log('Swagger docs: http://localhost:' + port + '/api');
}

bootstrap();
