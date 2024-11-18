import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class MethodGuard implements CanActivate {
  private readonly allowedMethods = ['POST', 'GET'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    //console.log(`Request Method: ${request.method}`); // Log the request method

    if (!this.allowedMethods.includes(request.method)) {
      throw new HttpException('Method Not Allowed', HttpStatus.METHOD_NOT_ALLOWED);
    }

    return true;
  }
}