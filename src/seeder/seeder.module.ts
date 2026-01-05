import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SeederService } from './seeder.service';
import { SeederCommand } from './seeder.command';
import { SitesSchema } from 'src/sites/entities/site.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([SitesSchema])],
  providers: [SeederService, SeederCommand],
})
export class SeederModule {}
