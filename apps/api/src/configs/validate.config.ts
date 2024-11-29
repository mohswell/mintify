import { ValidationPipe } from '@nestjs/common';

export const validateConfig = new ValidationPipe({
  whitelist: true,
  stopAtFirstError: false,
  transform: true,
  enableDebugMessages: true,
  forbidUnknownValues: true,
  validationError: {
    target: false,
    value: false,
  },
});