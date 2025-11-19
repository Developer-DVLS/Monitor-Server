import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SiteFetchService } from './services/site-fetch.service';
import { HealthCheckService } from './services/health-check.service';
import { MonitorScheduler } from './schedulers/monitor.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteStatusSchema } from './entities/site-status.entity';
import { SmsService } from './services/sms.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([SiteStatusSchema])],
  providers: [
    SiteFetchService,
    HealthCheckService,
    MonitorScheduler,
    SmsService,
  ],
})
export class MonitorModule {}
