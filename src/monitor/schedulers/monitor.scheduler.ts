import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HealthCheckService } from '../services/health-check.service';
import { SiteFetchService } from '../services/site-fetch.service';
import { SmsService } from '../services/sms.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../services/email.service';

@Injectable()
export class MonitorScheduler {
  private readonly logger = new Logger(MonitorScheduler.name);

  constructor(
    private siteFetch: SiteFetchService,
    private healthCheck: HealthCheckService,
    private sms: SmsService,
    private config: ConfigService,
    private sendMail: EmailService,
  ) {
    this.siteFetch.fetchSites();
  }

  @Cron('*/30 * * * * *')
  async handleMonitorInterval() {
    this.logger.log('Starting monitoring cycle');
    const sites = this.siteFetch.getSites();
    if (!sites.length) {
      this.logger.warn('No sites to monitor');
      return;
    }

    const promises = sites.map((site) => this.healthCheck.checkSite(site));
    const statuses = await Promise.all(promises);

    const sendToPhone = this.config.get('SEND_TO_PHONE') || '+9779764596223';
    const sendToEmail =
      this.config.get('SEND_TO_EMAIL') || 'p.awale@mydvls.com';

    for (const status of statuses) {
      if ((status as any).shouldAlert) {
        await this.sms.sendAlert(status, 'Alert', sendToPhone);
        this.sendMail.sendMessage(status, 'Alert', sendToEmail);
      }
      if ((status as any).recoveryAlert) {
        await this.sms.sendAlert(status, 'Recovery', sendToPhone);
        this.sendMail.sendMessage(status, 'Recovery', sendToEmail);
      }
    }
  }
}
