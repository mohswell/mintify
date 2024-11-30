import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.headers['content-type'] !== 'application/json') {
      throw new BadRequestException('Content-Type must be application/json');
    }
    next();
  }
}