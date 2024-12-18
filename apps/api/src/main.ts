import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionsFilter } from '~utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { validateConfig } from './configs/validate.config';
import { env } from './configs/env.config';
import * as express from 'express';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('Gemini API Example')
    .setDescription('API Documentation for Gemini integration')
    .setVersion('1.0')
    .addTag('gemini')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

// Add BigInt serialization globally
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('MemoryUsageLogger');
  app.enableCors();
  app.useGlobalPipes(validateConfig);
  app.use(express.json({ limit: '2000kb' }));
  app.use(express.urlencoded({ extended: false }));
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ApiExceptionsFilter(httpAdapterHost));
  app.use(compression());
  setupSwagger(app);

  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    logger.log('Memory Usage:', {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`, // Resident Set Size
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
    });
  }, 60000); // Log every 30 minutes
  await app.listen(env.PORT);
}
bootstrap();
