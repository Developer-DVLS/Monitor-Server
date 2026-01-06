import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceBusClientProvider } from 'src/providers/ServiceBusClientProvider';
import { SiteStatusSchema } from './entities/site-status.entity';
import { MonitorScheduler } from './schedulers/monitor.scheduler';
import { EmailService } from './services/email.service';
import { HealthCheckService } from './services/health-check.service';
import { SiteFetchService } from './services/site-fetch.service';
import { SmsService } from './services/sms.service';
import { SitesSchema } from 'src/sites/entities/site.entity';
import { SitesStatusService } from './services/site-status';
import { MonitorController } from './monitor.controller';
import { SSLCheckScheduler } from './schedulers/ssl-check.scheduler';
import { SslMonitorService } from './services/ssl-check.service';
import { SiteSSLStatusSchema } from './entities/site-ssl-status.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SiteStatusSchema,
      SitesSchema,
      SiteSSLStatusSchema,
    ]),
  ],
  controllers: [MonitorController],
  providers: [
    SiteFetchService,
    HealthCheckService,
    MonitorScheduler,
    SmsService,
    ServiceBusClientProvider,
    EmailService,
    SitesStatusService,
    SslMonitorService,
    SSLCheckScheduler,
  ],
  exports: [SslMonitorService],
})
export class MonitorModule {}
