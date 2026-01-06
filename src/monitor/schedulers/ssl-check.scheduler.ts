import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SslMonitorService } from '../services/ssl-check.service';

@Injectable()
export class SSLCheckScheduler {
  constructor(private sslChecker: SslMonitorService) {}

  @Cron('0 0 * * *')
  async hanldleCheckSSLInterval() {
    this.sslChecker.monitorAllSites();
  }
}
