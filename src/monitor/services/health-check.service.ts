import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AllSiteLocationSchema } from 'src/sites/entities/all-location-site.entity';
import { Repository } from 'typeorm';
import { SiteStatusSchema } from '../entities/site-status.entity';
import { SettingSchema } from 'src/settings/entities/setting.entity';

interface HealthCheckResult extends SiteStatusSchema {
  alertObject: {
    backend: boolean;
    frontend: boolean;
  };
  recoveryObject: {
    backend: boolean;
    frontend: boolean;
  };
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private httpService: HttpService,

    @InjectRepository(SiteStatusSchema)
    private settingRepo: Repository<SettingSchema>,

    @InjectRepository(SiteStatusSchema)
    private statusRepo: Repository<SiteStatusSchema>,
  ) {}

  async checkSite(site: AllSiteLocationSchema): Promise<HealthCheckResult> {
    try {
      const settingsConfig = await this.settingRepo.find();
      const settingsCount =
        settingsConfig && settingsConfig.length
          ? settingsConfig[0].site_status_count_threshold
          : 0;
      const start = Date.now();

      const frontend$ = this.pingUrl(site.frontend_url).then((up) => ({
        frontendUp: up,
      }));

      const backend$ = this.pingUrl(
        site.backend_url.concat(
          site.backend_url.endsWith('/') ? 'auth' : '/auth',
        ),
      ).then((up) => ({
        backendUp: up,
      }));

      const [frontend, backend] = await Promise.all([frontend$, backend$]);
      const now = new Date().toISOString();

      const previousStatus = await this.statusRepo.findOne({
        where: {
          siteLocation: {
            id: site.id,
          },
        },
      });

      const currentFrontendStatus = frontend.frontendUp;
      const currentBackendStatus = backend.backendUp;
      const previousFrontendStatus = previousStatus?.frontendUp;
      const previousBackendStatus = previousStatus?.backendUp;
      const previousBackendCount = previousStatus?.backend_count;
      const previousFrontendCount = previousStatus?.frontend_count;

      let healthCheckResult: HealthCheckResult = null;

      const statusEntity =
        previousStatus ||
        this.statusRepo.create({
          siteLocation: site,
          createdAt: now,
        });

      statusEntity.frontendUp = frontend.frontendUp;
      statusEntity.backendUp = backend.backendUp;
      statusEntity.lastChecked = now;
      statusEntity.updatedAt = now;
      statusEntity.siteLocation = site;

      const alertObject = {
        frontend: false,
        backend: false,
      };
      let recoveryObject = {
        frontend: false,
        backend: false,
      };

      if (previousStatus) {
        const frontendCountCycle = previousFrontendCount + 1;
        const backendCountCycle = previousBackendCount + 1;
        if (currentBackendStatus && !previousBackendStatus) {
          statusEntity.backendlastUp = now;
          recoveryObject.backend = true;
        }
        if (!currentBackendStatus && previousBackendStatus) {
          if (backendCountCycle <= settingsCount) {
            statusEntity.backendlastDown = now;
            alertObject.backend = true;
            statusEntity.backend_count = backendCountCycle;
          }
        }
        if (currentFrontendStatus && !previousFrontendStatus) {
          statusEntity.frontendlastUp = now;
          recoveryObject.frontend = true;
        }
        if (!currentFrontendStatus && previousFrontendStatus) {
          if (frontendCountCycle <= settingsCount) {
            statusEntity.frontendlastDown = now;
            alertObject.frontend = true;
            statusEntity.frontend_count = frontendCountCycle;
          }
        }
      } else {
        if (currentBackendStatus) {
          statusEntity.backendlastUp = now;
        } else {
          statusEntity.backendlastDown = now;
          alertObject.backend = true;
        }

        if (currentFrontendStatus) {
          statusEntity.frontendlastUp = now;
        } else {
          statusEntity.frontendlastDown = now;
          alertObject.frontend = true;
        }
      }

      await this.statusRepo.save(statusEntity);

      const duration = Date.now() - start;
      this.logger.log(
        `Checked ${site.name} in ${duration}ms: Frontend ${frontend.frontendUp ? 'UP' : 'DOWN'}, Backend ${backend.backendUp ? 'UP' : 'DOWN'}`,
      );

      healthCheckResult = { ...statusEntity, alertObject, recoveryObject };

      return healthCheckResult;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestException('Please recheck the payload');
      }

      console.error('Error creating site:', error);
      throw new InternalServerErrorException('Failed to create site');
    }
  }

  private async pingUrl(url: string): Promise<boolean> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.head(url, { timeout: 10000 }).pipe(timeout(10000)),
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      this.logger.warn(`Ping failed for ${url}: ${error.message}`);
      return false;
    }
  }
}
