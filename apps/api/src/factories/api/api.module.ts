import { Module } from '@nestjs/common';
import { ApiKeyService } from './api.service';
import { ApiMiddleware } from '~middleware/api.middleware';
import { PrismaModule } from '~factories/prisma/prisma.module';
import { ApiController } from './api.controller';
import { JwtMiddleware } from '~middleware/jwt.middleware';

@Module({
  imports: [PrismaModule],
  providers: [ApiMiddleware, ApiKeyService, JwtMiddleware], 
  exports: [ApiMiddleware, ApiKeyService, JwtMiddleware],
  controllers: [ApiController],
})
export class ApiModule {}
