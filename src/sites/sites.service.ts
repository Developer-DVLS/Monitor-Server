import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SslMonitorService } from 'src/monitor/services/ssl-check.service';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { SitesSchema } from './entities/site.entity';
import { AllSiteLocationSchema } from './entities/all-location-site.entity';
import { MonitorScheduler } from 'src/monitor/schedulers/monitor.scheduler';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(SitesSchema)
    private sitesRepo: Repository<SitesSchema>,
    @InjectRepository(AllSiteLocationSchema)
    private allLocationSiteRepo: Repository<AllSiteLocationSchema>,
    private siteMonitorService: MonitorScheduler,
    private siteSSLCheckService: SslMonitorService,
  ) {}

  async create(createSiteDto: CreateSiteDto): Promise<SitesSchema> {
    const now = new Date().toISOString();

    try {
      const newSite = this.sitesRepo.create({
        ...createSiteDto,
        created_date: now,
        updated_date: now,
      });

      const newCreateSite = await this.sitesRepo.save(newSite);

      this.siteSSLCheckService.monitorAllSites();
      this.siteMonitorService.handleMonitorInterval();

      const allLoc = new AllSiteLocationSchema();

      allLoc.site = newCreateSite;
      await this.allLocationSiteRepo.save(allLoc);

      return newCreateSite;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestException(
          'A site with this code_name or unique field already exists.',
        );
      }

      console.error('Error creating site:', error);
      throw new InternalServerErrorException('Failed to create site');
    }
  }

  async findAll(is_restaurant?: string): Promise<SitesSchema[]> {
    try {
      const queryOptions: FindManyOptions<SitesSchema> = {
        order: {
          name: 'ASC',
        },
        relations: {
          siteLocations: true,
        },
      };
      if (is_restaurant === 'true' || is_restaurant === 'false') {
        queryOptions.where = { is_restaurant: is_restaurant === 'true' };
      }

      return await this.sitesRepo.find(queryOptions);
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw new InternalServerErrorException('Failed to fetch sites');
    }
  }

  async findOne(id: number): Promise<SitesSchema> {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid site ID');
    }

    try {
      const site = await this.sitesRepo.findOne({
        where: { id },
      });

      if (!site) {
        throw new NotFoundException(`Site with ID ${id} not found`);
      }

      return site;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error finding site:', error);
      throw new InternalServerErrorException('Failed to fetch site');
    }
  }

  async update(id: number, updateSiteDto: CreateSiteDto): Promise<SitesSchema> {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid site ID');
    }

    try {
      const site = await this.sitesRepo.findOne({ where: { id } });

      if (!site) throw new BadRequestException('Invalid site');

      const updatedSite = this.sitesRepo.merge(site, {
        ...updateSiteDto,
        updated_date: new Date().toISOString(),
      });

      return await this.sitesRepo.save(updatedSite);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestException(
          'Update failed: code_name or unique field already exists',
        );
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error updating site:', error);
      throw new InternalServerErrorException('Failed to update site');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid site ID');
    }

    try {
      const site = await this.sitesRepo.findOne({ where: { id } });

      site.isActive = false;
      site.updated_date = new Date().toISOString();
      await this.sitesRepo.remove(site);

      return { message: `Site with ID ${id} has been deactivated` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error removing site:', error);
      throw new InternalServerErrorException('Failed to remove site');
    }
  }
}
