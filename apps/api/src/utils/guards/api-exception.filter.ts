import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ApiExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    console.error('Unhandled exception:', exception);

    // Exclude stack trace and simplify the error message for the client
    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };

    // Send the response without the stack trace
    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}
