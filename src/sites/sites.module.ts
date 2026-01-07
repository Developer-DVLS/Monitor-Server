import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesSchema } from './entities/site.entity';
import { SslMonitorService } from 'src/monitor/services/ssl-check.service';
import { SiteSSLStatusSchema } from 'src/monitor/entities/site-ssl-status.entity';
import { SiteLocationsSchema } from './entities/site-location.entity';
import { SiteLocationsService } from './services/site-locations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SitesSchema,
      SiteSSLStatusSchema,
      SiteLocationsSchema,
    ]),
  ],
  providers: [SitesService, SslMonitorService, SiteLocationsService],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
