import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export const Transporter = (configService: ConfigService) => {
  return nodemailer.createTransport({
    service: 'gmail',
    port: configService.get<string>('EMAIL_PORT'),
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  });
};