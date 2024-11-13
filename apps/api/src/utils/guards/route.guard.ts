import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    //UnauthorizedException,
  } from '@nestjs/common';
  
  @Injectable()
  export class RouteGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
  
      // Check if the route exists in the controller (valid route)
      if (!request.route) {
        throw new NotFoundException({
          message: 'The requested route was not found',
          statusCode: 404,
          error: 'Not Found',
        });
      }
  
      // Example of checking authorization logic if needed
      // const token = request.headers['authorization'];
      // if (!token) {
      //   throw new UnauthorizedException({
      //     message: 'Authorization token is missing',
      //     statusCode: 401,
      //     error: 'Unauthorized',
      //   });
      // }
  
      return true;
    }
  }
  