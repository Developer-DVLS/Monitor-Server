import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { timeAgo } from 'src/utils/date-utils';
import { HealthCheckService } from '../services/health-check.service';
import { SiteFetchService } from '../services/site-fetch.service';
import { SmsService } from '../services/sms.service';

@Injectable()
export class MonitorScheduler {
  private readonly logger = new Logger(MonitorScheduler.name);

  constructor(
    private siteFetch: SiteFetchService,
    private healthCheck: HealthCheckService,
    private sendCardAlert: SmsService,
  ) {}

  @Cron('*/10 * * * * *')
  async handleMonitorInterval() {
    this.logger.log('Starting monitoring cycle');
    const sites = await this.siteFetch.getSites();
    if (!sites.length) {
      this.logger.warn('No sites to monitor');
      return;
    }

    const promises = sites.map((site) => this.healthCheck.checkSite(site));
    const statuses = await Promise.all(promises);

    for (const status of statuses) {
      const { alertObject, recoveryObject } = status;
      if (alertObject.backend) {
        this.sendCardAlert.sendAlertCard({
          cause: 'Backend Down',
          checked_url: status.siteLocation.backend_url,
          incident_key: new Date()
            .toISOString()
            .concat(status.siteLocation.name),
          incident_url: status.siteLocation.backend_url,
          length: '',
          monitor: '',
          monitor_url: 'https://monitor-mydvls.vercel.app/',
          response: '502 Bad Gateway nginx/1.18.0 (Ubuntu)',
          title: `🔴 Site's Backend Went Down: ${status.siteLocation.name}`,
        });
      }

      if (alertObject.frontend) {
        this.sendCardAlert.sendAlertCard({
          cause: 'Frontend Down',
          checked_url: status.siteLocation.frontend_url,
          incident_key: new Date()
            .toISOString()
            .concat(status.siteLocation.name),
          incident_url: status.siteLocation.frontend_url,
          length: '',
          monitor: '',
          monitor_url: 'https://monitor-mydvls.vercel.app/',
          response: '502 Bad Gateway nginx/1.18.0 (Ubuntu)',
          title: `🔴 Site's Frontend Went Down: ${status.siteLocation.name}`,
        });
      }

      if (recoveryObject.frontend) {
        this.sendCardAlert.sendAlertCard({
          cause: 'Frontend Back Online',
          checked_url: status.siteLocation.frontend_url,
          incident_key: new Date()
            .toISOString()
            .concat(status.siteLocation.name),
          incident_url: status.siteLocation.frontend_url,
          length: timeAgo(status.frontendlastDown),
          monitor: '',
          monitor_url: 'https://monitor-mydvls.vercel.app/',
          response: '200 OK',
          title: `🟢 Site's Frontend Back Online: ${status.siteLocation.name}`,
        });
      }

      if (recoveryObject.backend) {
        this.sendCardAlert.sendAlertCard({
          cause: 'Backend Back Online',
          checked_url: status.siteLocation.backend_url,
          incident_key: new Date()
            .toISOString()
            .concat(status.siteLocation.name),
          incident_url: status.siteLocation.backend_url,
          length: timeAgo(status.backendlastDown),
          monitor: '',
          monitor_url: 'https://monitor-mydvls.vercel.app/',
          response: '200 OK',
          title: `🟢 Site's Backend Back Online: ${status.siteLocation.name}`,
        });
      }
    }
  }
}
