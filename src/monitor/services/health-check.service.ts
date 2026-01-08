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

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private httpService: HttpService,

    @InjectRepository(SiteStatusSchema)
    private statusRepo: Repository<SiteStatusSchema>,
  ) {}

  async checkSite(site: AllSiteLocationSchema): Promise<SiteStatusSchema> {
    try {
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
      const now = new Date();

      const overallUp = frontend.frontendUp && backend.backendUp;

      const previousStatus = await this.statusRepo.findOne({
        where: { siteLocation: site },
      });

      const statusEntity =
        previousStatus ||
        this.statusRepo.create({
          siteLocation: site,
          createdAt: now,
        });

      statusEntity.frontendUp = frontend.frontendUp;
      statusEntity.backendUp = backend.backendUp;
      statusEntity.overallUp = overallUp;
      statusEntity.lastChecked = now;
      statusEntity.updatedAt = now;
      statusEntity.siteLocation = site;

      let shouldAlert = false;
      let recoveryAlert = false;

      if (previousStatus) {
        const wasUp = previousStatus.overallUp;
        if (wasUp && !overallUp) {
          shouldAlert = true;
          this.logger.warn(`Transition detected: Site ${site.name} went DOWN`);
        } else if (!wasUp && overallUp) {
          recoveryAlert = true;
          this.logger.log(`Recovery: Site ${site.name} is back UP`);
        }
      } else {
        if (!overallUp) {
          shouldAlert = true;
          this.logger.warn(`Transition detected: Site ${site.name} went DOWN`);
        } else {
          shouldAlert = false;
          recoveryAlert = false;
        }
      }

      await this.statusRepo.save(statusEntity);

      const duration = Date.now() - start;
      this.logger.log(
        `Checked ${site.name} in ${duration}ms: Frontend ${frontend.frontendUp ? 'UP' : 'DOWN'}, Backend ${backend.backendUp ? 'UP' : 'DOWN'}, Overall ${overallUp ? 'UP' : 'DOWN'}${shouldAlert ? ' → ALERT!' : ''}`,
      );

      (statusEntity as any).shouldAlert = shouldAlert;
      (statusEntity as any).recoveryAlert = recoveryAlert;
      return statusEntity;
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
