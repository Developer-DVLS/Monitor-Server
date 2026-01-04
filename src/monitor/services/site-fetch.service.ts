import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Site } from '../entities/site.entity';

@Injectable()
export class SiteFetchService {
  private readonly logger = new Logger(SiteFetchService.name);
  private sites: Site[] = [];

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async fetchSites(): Promise<Site[]> {
    try {
      const url = this.config.get('DASH_SITE') + 'api/v1/restaurants/';
      const response = await firstValueFrom(this.httpService.get(url));
      this.sites = response.data;
      this.logger.log(`Fetched ${this.sites.length} sites`);
      return this.sites;
    } catch (error) {
      this.logger.error('Failed to fetch sites', error);
      return this.sites;
    }
  }

  getSites(): Site[] {
    return this.sites;
  }
}
