import { Module } from '@nestjs/common';
import { GeminiProModelProvider, GeminiProVisionModelProvider } from './application/gemini.provider';
import { GeminiService } from './application/gemini.service';
import { GeminiController } from './presenters/http/gemini.controller';
import { ContentFormatterService } from './application/helpers/content.formatter';
import { TestFormatterService } from './application/helpers/test-formatter.helper';
import { TraitsModule } from './traits/traits.module';

@Module({
  controllers: [GeminiController],
  providers: [
    GeminiService,
    GeminiProModelProvider,
    GeminiProVisionModelProvider,
    ContentFormatterService,
    TestFormatterService,
  ],
  imports: [TraitsModule],
})
export class GeminiModule {}
