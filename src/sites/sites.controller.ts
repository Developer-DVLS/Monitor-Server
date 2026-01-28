import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSiteLocationDto } from './dto/create-site-location.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { SiteLocationsService } from './services/site-locations.service';
import { SitesService } from './sites.service';
import { ParseOptionalBoolPipe } from 'src/pipes/parse-optional-bool.pipe';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,

    private readonly siteLocationsService: SiteLocationsService,
  ) {}

  @Post()
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.sitesService.create(createSiteDto);
  }

  @Get()
  findAll(
    @Query('is_restaurant')
    is_restaurant?: string | undefined,
  ) {
    return this.sitesService.findAll(is_restaurant);
  }

  @Get('all-locations-sites')
  findAllLocationsSites() {
    return this.siteLocationsService.findAllLocationSites();
  }

  @Post('locations')
  createLocation(@Body() createSiteLocationDto: CreateSiteLocationDto) {
    return this.siteLocationsService.createLocation(createSiteLocationDto);
  }

  @Patch('locations/:id')
  updateLocation(
    @Param('id') id: string,
    @Body() updateSiteDto: CreateSiteLocationDto,
  ) {
    return this.siteLocationsService.updateSiteLocation(+id, updateSiteDto);
  }

  @Get('locations')
  findAllLocations() {
    return this.siteLocationsService.findAllLocations();
  }

  @Delete('locations/:id')
  removeLocation(@Param('id') id: string) {
    return this.siteLocationsService.remove(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiteDto: CreateSiteDto) {
    return this.sitesService.update(+id, updateSiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sitesService.remove(+id);
  }
}
