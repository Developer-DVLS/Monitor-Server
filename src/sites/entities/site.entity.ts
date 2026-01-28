import { SiteSSLStatusSchema } from 'src/monitor/entities/site-ssl-status.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SiteLocationsSchema } from './site-location.entity';
import { AllSiteLocationSchema } from './all-location-site.entity';

@Entity('sites')
export class SitesSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ unique: true })
  code_name: string;

  @Column()
  logo: string;

  @Column()
  frontend_url: string;

  @Column()
  backend_url: string;

  @Column({ nullable: true })
  printer_url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  location_id: number;

  @Column()
  created_date: string;

  @Column()
  updated_date: string;

  @Column({ default: true })
  is_restaurant: boolean;

  @Column({ type: 'boolean', default: false })
  need_ssl_renewal: boolean;

  @OneToMany(() => SiteLocationsSchema, (location) => location.site, {
    cascade: true,
  })
  siteLocations: SiteLocationsSchema[];

  @OneToMany(() => SiteSSLStatusSchema, (ssl) => ssl.site, {
    cascade: true,
  })
  sslStatuses: SiteSSLStatusSchema[];

  @OneToOne(() => AllSiteLocationSchema, (asl) => asl.site, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
  })
  allSiteLocation?: AllSiteLocationSchema;
}
