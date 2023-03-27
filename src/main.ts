import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import config from '@/shared/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@shared/pipes/validation.pipe';
import { createDatabaseIfDoesntExist } from '@shared/utils/database';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
const { version } = require('../package.json');
async function bootstrap() {
  const fastify = new FastifyAdapter({
    logger: config.app.env !== 'production',
    requestTimeout: 5000,
  });
  await createDatabaseIfDoesntExist();
  const app = await NestFactory.create(AppModule, fastify);
  app.enableCors();

  const swagggerConfig = new DocumentBuilder()
    .setTitle('Air Quality')
    .setDescription('The Air Quality API')
    .setVersion(version)
    .addTag('air')
    .build();
  const document = SwaggerModule.createDocument(app, swagggerConfig);
  SwaggerModule.setup('api', app, document);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.app.port, config.app.url);
}

bootstrap();
