import { Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { SitesStatusService } from './services/site-status';
import { SslMonitorService } from './services/ssl-check.service';

@Controller('monitor')
export class MonitorController {
  constructor(
    private sendMail: EmailService,
    private config: ConfigService,
    private readonly sitesStatusService: SitesStatusService,
    private readonly sitesSSLStatusService: SslMonitorService,
  ) {}

  @Get('status')
  getResponse() {
    return this.sitesStatusService.getAllSitesStatus();
  }

  // @Post()
  // sendEmail() {
  //   const sendToEmail = this.config.get('SEND_TO_EMAIL').split(':');
  //   return this.sendMail.sendMessage(
  //     {
  //       backendUp: false,
  //       createdAt: new Date(),
  //       frontendUp: true,
  //       lastChecked: new Date(),
  //       overallUp: false,
  //       site: {
  //         name: 'Test Email',
  //         location: 'USA',
  //         frontend_url: 'https://chowchowexpress.com/',
  //         backend_url: 'https://chowchowexpress.com/',
  //         code_name: '001',
  //         verification_phone_number: '',
  //         logo: '',
  //         id: 1,
  //         created_date: '2025-08-31T05:02:00.021733',
  //         updated_date: '2025-09-02T12:57:54.672166',
  //       },
  //       siteId: 4,
  //       updatedAt: new Date(),
  //     },
  //     'Alert',
  //     sendToEmail,
  //   );
  // }

  @Get('ssl')
  getAllSiteSSLStatus() {
    return this.sitesSSLStatusService.findAll();
  }
}
