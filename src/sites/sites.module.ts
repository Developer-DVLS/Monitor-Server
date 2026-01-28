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

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      SitesSchema,
      SiteSSLStatusSchema,
      SiteLocationsSchema,
      AllSiteLocationSchema,
    ]),
  ],
  providers: [
    SmsService,
    SitesService,
    SslMonitorService,
    SiteLocationsService,
    AllSiteLocationSchema,
  ],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
