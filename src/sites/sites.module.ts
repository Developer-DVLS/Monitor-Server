import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesSchema } from './entities/site.entity';
import { SslMonitorService } from 'src/monitor/services/ssl-check.service';
import { SiteSSLStatusSchema } from 'src/monitor/entities/site-ssl-status.entity';
import { SiteLocationsSchema } from './entities/site-location.entity';
import { SiteLocationsService } from './services/site-locations.service';
import { AllSiteLocationSchema } from './entities/all-location-site.entity';
import { SmsService } from 'src/monitor/services/sms.service';
import { HttpModule } from '@nestjs/axios';
import { MonitorScheduler } from 'src/monitor/schedulers/monitor.scheduler';
import { HealthCheckService } from 'src/monitor/services/health-check.service';
import { SiteStatusSchema } from 'src/monitor/entities/site-status.entity';
import { SiteFetchService } from 'src/monitor/services/site-fetch.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SitesSchema,
      SiteSSLStatusSchema,
      SiteLocationsSchema,
      AllSiteLocationSchema,
      SiteStatusSchema,
    ]),
  ],
  providers: [
    SiteFetchService,
    SmsService,
    SitesService,
    SslMonitorService,
    SiteLocationsService,
    AllSiteLocationSchema,
    HealthCheckService,
    MonitorScheduler,
  ],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
