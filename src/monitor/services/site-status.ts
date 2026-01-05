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
    return await this.sitesStatusRepo.find();
  }
}
