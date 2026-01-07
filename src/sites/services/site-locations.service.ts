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
import { AllLocations } from 'src/types/sites';

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

      if (site.location_id === createSiteLocationDto.location_id)
        throw new BadRequestException(
          'Loation ID cannot be same with main Location',
        );

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

  async findAllLocationSites(): Promise<AllLocations[]> {
    try {
      const sites = await this.siteRepo.find({
        order: {
          name: 'ASC',
        },
        relations: {
          siteLocations: true,
        },
      });
      let allLocations: AllLocations[] = [];
      for (const site of sites) {
        const {
          backend_url,
          code_name,
          frontend_url,
          location,
          location_id,
          name,
          printer_url,
        } = site;

        allLocations.push({
          backend_url,
          code_name,
          frontend_url,
          location,
          location_id,
          name,
          printer_url,
        });

        const siteLocations = site.siteLocations;

        for (const locations of siteLocations) {
          allLocations.push({
            backend_url,
            code_name,
            frontend_url,
            location: locations.location,
            location_id: locations.location_id,
            name: locations.name,
            printer_url,
          });
        }
      }
      return allLocations;

      // const results = await this.siteRepo
      //   .createQueryBuilder('site')
      //   .innerJoin('site.siteLocations', 'loc')
      //   .select([
      //     'loc.name AS name',
      //     'loc.location AS location',
      //     'loc.location_id AS location_id',
      //     'site.code_name AS code_name',
      //     'site.frontend_url AS frontend_url',
      //     'site.backend_url AS backend_url',
      //     'site.printer_url AS printer_url',
      //   ])
      //   .orderBy('loc.name', 'ASC')
      //   .getRawMany();

      // return results.map((r) => ({
      //   name: r.name,
      //   location: r.location,
      //   location_id: r.location_id,
      //   code_name: r.code_name,
      //   frontend_url: r.frontend_url,
      //   backend_url: r.backend_url,
      //   printer_url: r.printer_url,
      // }));
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
