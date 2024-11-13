import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
    GeminiModule, 
    AuthModule
  ],
  controllers: [AppController],
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
    consumer
      .apply(JwtMiddleware) 
      .exclude('/', 'api/v1/auth/signup', 'api/v1/auth/login')
      .forRoutes('*'); // Apply to all routes except those excluded
  }
}
