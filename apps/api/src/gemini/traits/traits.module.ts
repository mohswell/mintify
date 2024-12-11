import { Module } from '@nestjs/common';
import { TestExtensionService } from './extensions/extensions.service';

@Module({
  providers: [TestExtensionService],
  exports: [TestExtensionService],
})
export class TraitsModule {}
