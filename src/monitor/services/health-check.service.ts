import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Site, SiteStatus } from '../entities/site.entity';
import { timeout } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteStatusSchema } from '../entities/site-status.entity';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private statuses = new Map<number, SiteStatus>();

  constructor(
    private httpService: HttpService,
    @InjectRepository(SiteStatusSchema)
    private statusRepo: Repository<SiteStatusSchema>,
  ) {}

  async checkSite(site: Site): Promise<SiteStatusSchema> {
    const start = Date.now();
    const frontend$ = this.pingUrl(site.frontend_url).then((up) => ({
      frontendUp: up,
    }));
    const backend$ = this.pingUrl(site.backend_url + 'auth').then((up) => ({
      backendUp: up,
    }));

    const [frontend, backend] = await Promise.all([frontend$, backend$]);
    const now = new Date();

    const overallUp = frontend.frontendUp && backend.backendUp;

    const previousStatus = await this.statusRepo.findOne({
      where: { siteId: site.id },
    });

    const statusEntity =
      previousStatus ||
      this.statusRepo.create({
        siteId: site.id,
        createdAt: now,
      });

    statusEntity.site = site;
    statusEntity.frontendUp = frontend.frontendUp;
    statusEntity.backendUp = backend.backendUp;
    statusEntity.overallUp = overallUp;
    statusEntity.lastChecked = now;
    statusEntity.updatedAt = now;

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

  getAllStatuses(): SiteStatus[] {
    return Array.from(this.statuses.values());
  }
}
