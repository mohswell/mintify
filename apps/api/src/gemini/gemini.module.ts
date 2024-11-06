import { Module } from '@nestjs/common';
import { GeminiController } from './presenters/http/gemini.controller';
import { GeminiService } from './application/gemini.service';
import { env } from 'src/config/env.config';

@Module({
  controllers: [GeminiController],
  providers: [
    GeminiService,
    {
      provide: 'GEMINI_PRO_MODEL',
      useValue: env.GEMINI.PRO_MODEL,
    },
    {
      provide: 'GEMINI_PRO_VISION_MODEL',
      useValue: env.GEMINI.PRO_VISION_MODEL,
    },
  ],
})
export class GeminiModule {}
