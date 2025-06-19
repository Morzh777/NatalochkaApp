import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from '@fastify/cors'; // Не забудь если надо CORS

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Разрешить CORS
  await app.register(cors, {
    origin: '*', // если нужно ограничить, здесь можно указать домен
  });

  // Установить глобальный префикс /api
  app.setGlobalPrefix('api');

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Наталочка Description API')
    .setDescription('API документация для микросервиса описаний')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document); // Теперь доступно по http://localhost:3002/docs

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3002, '0.0.0.0');

  console.log(`🚀 Сервер запущен на http://localhost:${process.env.PORT || 3002}/api`);
  console.log(`📚 Swagger доступен на http://localhost:${process.env.PORT || 3002}/docs`);
}

bootstrap();
