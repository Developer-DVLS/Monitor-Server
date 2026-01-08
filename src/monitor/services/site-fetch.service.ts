import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AllSiteLocationSchema } from 'src/sites/entities/all-location-site.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SiteFetchService {
  private readonly logger = new Logger(SiteFetchService.name);

  constructor(
    @InjectRepository(AllSiteLocationSchema)
    private allLocationSiteRepo: Repository<AllSiteLocationSchema>,
  ) {}

  async getSites(): Promise<AllSiteLocationSchema[]> {
    try {
      return await this.allLocationSiteRepo.find({
        order: {
          name: 'ASC',
        },
      });
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw new InternalServerErrorException('Failed to fetch sites');
    }
  }
}
