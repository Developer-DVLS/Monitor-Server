import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SitesSchema } from './site.entity';
import { SiteLocationsSchema } from './site-location.entity';
import { AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { SiteStatusSchema } from 'src/monitor/entities/site-status.entity';

@Entity('all_location_site')
export class AllSiteLocationSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  frontend_url: string;

  @Column()
  backend_url: string;

  @Column()
  printer_url: string;

  @Column({ default: 1 })
  location_id: number;

  @Column({ nullable: true })
  siteId: number | null;

  @Column({ nullable: true })
  siteLocationId: number | null;

  @Column({ nullable: true })
  ownerType: 'site' | 'site_location' | null;

  @OneToOne(() => SiteStatusSchema, (status) => status.siteLocation, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
  })
  siteStatus?: SiteStatusSchema;

  @OneToOne(() => SitesSchema, (site) => site.allSiteLocation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'siteId' })
  site?: SitesSchema;

  @OneToOne(() => SiteLocationsSchema, (loc) => loc.allSiteLocation, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'siteLocationId' })
  siteLocation?: SiteLocationsSchema;

  @AfterLoad()
  @BeforeInsert()
  @BeforeUpdate()
  private syncFromParent() {
    if (this.site) {
      this.name = this.site.name;
      this.location = this.site.location;
      this.location_id = this.site.location_id;
      this.backend_url = this.site.backend_url;
      this.frontend_url = this.site.frontend_url;
      this.printer_url = this.site.printer_url;
      this.ownerType = 'site';
      this.siteId = this.site.id;
      this.siteLocationId = null;
      this.siteLocation = undefined;
    } else if (this.siteLocation) {
      this.name = this.siteLocation.name;
      this.location = this.siteLocation.location;
      this.location_id = this.siteLocation.location_id;
      this.ownerType = 'site_location';
      this.siteLocationId = this.siteLocation.id;
      this.siteId = null;
      this.backend_url = this.siteLocation.site.backend_url;
      this.frontend_url = this.siteLocation.site.frontend_url;
      this.printer_url = this.siteLocation.site.printer_url;
      this.site = undefined;
    }
  }
}
