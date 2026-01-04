import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SiteFetchService } from './services/site-fetch.service';
import { HealthCheckService } from './services/health-check.service';
import { MonitorScheduler } from './schedulers/monitor.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteStatusSchema } from './entities/site-status.entity';
import { SmsService } from './services/sms.service';
import { ServiceBusClientProvider } from 'src/providers/ServiceBusClientProvider';
import { EmailService } from './services/email.service';
import { SitesSchema } from './entities/sites.entity';
import { SeederService } from 'src/seeder/seeder.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([SiteStatusSchema, SitesSchema]),
  ],
  providers: [
    SiteFetchService,
    HealthCheckService,
    MonitorScheduler,
    SmsService,
    ServiceBusClientProvider,
    EmailService,
    SeederService,
  ],
})
export class MonitorModule {}
