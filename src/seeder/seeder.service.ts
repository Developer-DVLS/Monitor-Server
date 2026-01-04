import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitesSchema } from '../monitor/entities/sites.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(SitesSchema)
    private readonly sitesRepository: Repository<SitesSchema>,
    private config: ConfigService,
  ) {}

  async seedDatabase() {
    const existingCount = await this.sitesRepository.count();
    if (existingCount > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    try {
      const url = this.config.get('DASH_SITE') + 'api/v1/restaurants/';
      const response = await firstValueFrom(this.httpService.get(url));
      const dataArray = response.data;

      const transformedData = dataArray.map((item: any) => ({
        ...item,
        isActive: true,
        subLocations: [],
      }));

      await this.sitesRepository.save(transformedData);

      console.log(
        `Database seeded successfully with ${transformedData.length} records.`,
      );
    } catch (error) {
      console.error('Failed to seed database:', error);
      throw error;
    }
  }
}
