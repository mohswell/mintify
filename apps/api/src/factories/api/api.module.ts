import { Module } from '@nestjs/common';
import { ApiKeyService } from './api.service';
import { ApiMiddleware } from '~middleware/api.middleware';
import { PrismaModule } from '~factories/prisma/prisma.module';
import { ApiController } from './api.controller';

@Module({
  imports: [PrismaModule],
  providers: [ApiMiddleware, ApiKeyService],
  exports: [ApiMiddleware],
  controllers: [ApiController],
})
export class ApiModule {}
