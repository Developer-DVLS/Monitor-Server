import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SitesSchema } from './site.entity';
import { AllSiteLocationSchema } from './all-location-site.entity';

@Entity('site_locations')
export class SiteLocationsSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1, unique: true })
  location_id: number;

  @Column()
  created_date: string;

  @Column()
  updated_date: string;

  @ManyToOne(() => SitesSchema, (site) => site.siteLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'siteId' })
  site: SitesSchema;

  @OneToOne(() => AllSiteLocationSchema, (asl) => asl.siteLocation, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
  })
  allSiteLocation?: AllSiteLocationSchema;
}
