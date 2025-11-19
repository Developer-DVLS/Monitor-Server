import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HealthCheckService } from '../services/health-check.service';
import { SiteFetchService } from '../services/site-fetch.service';
import { SmsService } from '../services/sms.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonitorScheduler {
  private readonly logger = new Logger(MonitorScheduler.name);

  constructor(
    private siteFetch: SiteFetchService,
    private healthCheck: HealthCheckService,
    private sms: SmsService,
    private config: ConfigService,
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

    const sendToPhone = this.config.get('SEND_TO_PHONE');

    for (const status of statuses) {
      if ((status as any).shouldAlert) {
        await this.sms.sendAlert(status, sendToPhone, 'Alert');
      }
      if ((status as any).recoveryAlert) {
        await this.sms.sendAlert(status, sendToPhone, 'Recovery');
      }
    }
  }
}
