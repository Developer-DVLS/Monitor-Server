import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteStatusSchema } from '../entities/site-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SitesStatusService {
  constructor(
    @InjectRepository(SiteStatusSchema)
    private sitesStatusRepo: Repository<SiteStatusSchema>,
  ) {}

  async getAllSitesStatus() {
    return await this.sitesStatusRepo.find({
      relations: {
        siteLocation: {
          site: true,
        },
      },
    });
  }

  async getAllSitesLatestStatus() {
    return await this.sitesStatusRepo
      .createQueryBuilder('status')
      .leftJoinAndSelect('status.siteLocation', 'location')
      .where(
        `status.id = (
        SELECT MAX(s2.id)
        FROM site_status s2
        WHERE s2."siteId" = status."siteId"
      )`,
      )
      .getMany();
  }
}
