import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';

@Entity('site_status')
export class SiteStatusSchema {
  @PrimaryColumn()
  siteId: number;

  @Column('json')
  site: Site;

  @Column({ default: true })
  frontendUp: boolean;

  @Column({ default: true })
  backendUp: boolean;

  @Column({ type: 'boolean', default: true })
  overallUp: boolean;

  @Column({ type: 'date'})
  lastChecked: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
