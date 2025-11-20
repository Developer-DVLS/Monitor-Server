import { Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';

@Controller('monitor')
export class MonitorController {
  constructor(
    private sendMail: EmailService,
    private config: ConfigService,
  ) {}

  @Get()
  getResponse() {
    return 'monitor api route';
  }

  @Post()
  sendEmail() {
    const sendToEmail = this.config.get('SEND_TO_EMAIL').split(':');
    return this.sendMail.sendMessage(
      {
        backendUp: false,
        createdAt: new Date(),
        frontendUp: true,
        lastChecked: new Date(),
        overallUp: false,
        site: {
          name: 'Fuji',
          location: 'USA',
          frontend_url: 'https://frontend-fuji.chowchownow.com/',
          backend_url: 'https://api-fuji.chowchownow.com/',
          code_name: '0017',
          verification_phone_number: '',
          logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTsYKdBXL69yll6ucTRfaUPGt5QmJhxgua_A&s',
          id: 2,
          created_date: '2025-08-31T05:02:00.021733',
          updated_date: '2025-09-02T12:57:54.672166',
        },
        siteId: 4,
        updatedAt: new Date(),
      },
      'Alert',
      sendToEmail,
    );
  }
}
