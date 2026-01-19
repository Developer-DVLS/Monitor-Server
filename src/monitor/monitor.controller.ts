import { Controller, Delete, Get, Post } from '@nestjs/common';
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

  @Get('ssl')
  getAllSiteSSLStatus() {
    return this.sitesSSLStatusService.findAll();
  }

  @Delete('ssl')
  deleteAllSiteSSLStatus() {
    return this.sitesSSLStatusService.clearSiteSSLStatus();
  }
}
