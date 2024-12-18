import { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Handle favicon separately
    if (request.url === '/favicon.ico') {
      response.status(204).end();
      return;
    }

    // Check if the route is an API route
    if (request.url.startsWith('/api')) {
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.NOT_FOUND; // Or INTERNAL_SERVER_ERROR as appropriate

      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Route not found';

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: typeof message === 'object' ? message : { message }
      });
      return;
    }

    // Fallback error handling for non-API routes
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? message : { message }
    });
  }
}
