import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteLocationsSchema } from '../entities/site-location.entity';
import { CreateSiteLocationDto } from '../dto/create-site-location.dto';
import { SitesSchema } from '../entities/site.entity';

@Injectable()
export class SiteLocationsService {
  constructor(
    @InjectRepository(SiteLocationsSchema)
    private siteLocationsRepo: Repository<SiteLocationsSchema>,

    @InjectRepository(SitesSchema)
    private siteRepo: Repository<SitesSchema>,
  ) {}

  async createLocation(
    createSiteLocationDto: CreateSiteLocationDto,
  ): Promise<SiteLocationsSchema> {
    if (
      !createSiteLocationDto.siteId ||
      isNaN(createSiteLocationDto.siteId) ||
      createSiteLocationDto.siteId <= 0
    ) {
      throw new BadRequestException('Invalid site ID');
    }

    const now = new Date().toISOString();

    try {
      const site = await this.siteRepo.findOne({
        where: { id: createSiteLocationDto.siteId },
      });

      if (!site)
        throw new BadRequestException('No site found with the provided ID');

      const newSiteLocation = this.siteLocationsRepo.create({
        ...createSiteLocationDto,
        site,
        created_date: now,
        updated_date: now,
      });

      const newCreateSiteLocation =
        await this.siteLocationsRepo.save(newSiteLocation);

      return newCreateSiteLocation;
    } catch (error: any) {
      console.log('Error');
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestException('A site or unique field already exists.');
      }

      console.error('Error creating site:', error);
      throw new InternalServerErrorException('Failed to create site');
    }
  }

  async findAllLocations(): Promise<SiteLocationsSchema[]> {
    try {
      return await this.siteLocationsRepo.find({
        order: {
          name: 'ASC',
        },
      });
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw new InternalServerErrorException('Failed to fetch sites');
    }
  }

  async findOneLocation(id: number): Promise<SiteLocationsSchema> {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid site ID');
    }

    try {
      const site = await this.siteLocationsRepo.findOne({
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

  async updateSiteLocation(
    id: number,
    updateSiteLocationDto: CreateSiteLocationDto,
  ): Promise<SiteLocationsSchema> {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid site ID');
    }

    try {
      const siteLocation = await this.siteLocationsRepo.findOne({
        where: { id },
      });

      if (!siteLocation) throw new BadRequestException('Invalid site');

      const updatedSiteLocation = this.siteLocationsRepo.merge(siteLocation, {
        ...updateSiteLocationDto,
        updated_date: new Date().toISOString(),
      });

      return await this.siteLocationsRepo.save(updatedSiteLocation);
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
      const site = await this.siteLocationsRepo.findOne({ where: { id } });

      site.isActive = false;
      site.updated_date = new Date().toISOString();
      // await this.sitesRepo.save(site);
      await this.siteLocationsRepo.remove(site);

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
