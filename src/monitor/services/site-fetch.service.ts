import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Site } from '../entities/site.entity';

const Test_Sites = [
  {
    name: 'Norbus',
    location: 'USA',
    frontend_url: 'https://frontend-norbus.chowchownow.com/',
    backend_url: 'https://api-norbus.chowchownow.com/',
    code_name: '0016',
    verification_phone_number: '',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTsYKdBXL69yll6ucTRfaUPGt5QmJhxgua_A&s',
    id: 1,
    created_date: '2025-08-31T05:02:00.021733',
    updated_date: '2025-09-02T12:57:54.672166',
  },
  {
    name: 'Fuji',
    location: 'USA',
    frontend_url: 'https://frontend-fuji.chowchownow.com/',
    backend_url: 'https://api-fuji.chowchownow.com/',
    code_name: '0017',
    verification_phone_number: '',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTsYKdBXL69yll6ucTRfaUPGt5QmJhxgua_A&s',
    id: 2,
    created_date: '2025-08-31T05:02:00.021733',
    updated_date: '2025-09-02T12:57:54.672166',
  },
];

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
      // const response = await firstValueFrom(this.httpService.get(url));
      // this.sites = response.data;
      // this.logger.log(`Fetched ${this.sites.length} sites`);
      // return this.sites;
      return Test_Sites
    } catch (error) {
      this.logger.error('Failed to fetch sites', error);
      return this.sites;
    }
  }

  getSites(): Site[] {
    return this.sites;
  }
}
