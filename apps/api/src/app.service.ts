import { Injectable } from '@nestjs/common';
import { z } from 'zod';
const schema = z.object({
  name: z.string(),
  age: z.number(),
});

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
