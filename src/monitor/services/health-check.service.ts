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
  private statuses = new Map<number, SiteStatus>(); // In-memory store

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

    const newStatus = this.statusRepo.create({
      siteId: site.id,
      site,
      ...frontend,
      ...backend,
      overallUp,
      lastChecked: now,
    });

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

    await this.statusRepo.save(newStatus);

    const duration = Date.now() - start;
    this.logger.log(
      `Checked ${site.name} in ${duration}ms: Frontend ${frontend.frontendUp ? 'UP' : 'DOWN'}, Backend ${backend.backendUp ? 'UP' : 'DOWN'}, Overall ${overallUp ? 'UP' : 'DOWN'}${shouldAlert ? ' → ALERT!' : ''}`,
    );

    (newStatus as any).shouldAlert = shouldAlert;
    (newStatus as any).recoveryAlert = recoveryAlert;
    return newStatus;
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

  isDown(siteId: number, threshold = 2): boolean {
    const status = this.statuses.get(siteId);
    return status && status.consecutiveFailures >= threshold;
  }
}
