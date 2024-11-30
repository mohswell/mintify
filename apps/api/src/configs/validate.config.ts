import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const validateConfig = new ValidationPipe({
  whitelist: false, // Strips unrecognized properties flse now
  stopAtFirstError: false, // Collects all validation errors
  transform: true, // Automatically transforms request data to DTO types
  enableDebugMessages: true, // Enable debugging info
  forbidUnknownValues: true, // Reject unknown properties
  validationError: {
    target: false, // Hides "target" in validation error output
    value: true, // Shows invalid values in errors
  },
  // exceptionFactory: (errors) => {
  //   console.error('Validation Errors:', errors);
  //   return new BadRequestException(
  //     errors.map((err) => Object.values(err.constraints).join(', ')).join('; ')
  //   );
  // },
});
