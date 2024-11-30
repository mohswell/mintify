import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter, RouteGuard } from '~utils/guards';
import { JwtMiddleware } from '~middleware/jwt.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiModule } from './gemini/gemini.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '~factories';
import { ApiModule } from '~factories/api/api.module';
import { GithubModule } from '~domains/github/github.module';
import { HealthController } from '~log/health/health.controller';
import { RequestLoggerMiddleware } from '~middleware/extensions/logger.middleware';
import { TerminusModule } from '@nestjs/terminus';
import { ContentTypeMiddleware } from '~middleware/content/content.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // Default cache TTL (5 minutes)
    }),
    ThrottlerModule.forRoot([{
      ttl: 10000, // 3 requests in 10 seconds
      limit: 3,
    }]),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',   // For short intervals (1 second)
    //     ttl: 1000,       // Time-to-live in milliseconds
    //     limit: 1,        // Limit to 1 requests
    //   },
    //   {
    //     name: 'medium',  // For medium intervals (10 seconds)
    //     ttl: 10000,      // Time-to-live in milliseconds
    //     limit: 5,       // Limit to 5 requests
    //   },
    //   {
    //     name: 'long',    // For long intervals (1 minute)
    //     ttl: 60000,      // Time-to-live in milliseconds
    //     limit: 50,      // Limit to 50 requests
    //   }
    // ]),
    TerminusModule,
    GeminiModule,
    AuthModule,
    PrismaModule,
    ApiModule,
    GithubModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RouteGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request logger middleware to all routes
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*');

    consumer
      .apply(ContentTypeMiddleware)
      .exclude('/')
      .forRoutes({ path: '*', method: RequestMethod.POST });


    consumer
      .apply(JwtMiddleware)
      .exclude(
        '/',
        'api/v1/auth/signup',
        'api/v1/auth/login',
        { path: 'api/v1/auth/github-login', method: RequestMethod.POST }
      )
      .forRoutes(
        "*"
      );
  }
}