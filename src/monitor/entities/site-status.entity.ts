import { AllSiteLocationSchema } from 'src/sites/entities/all-location-site.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_status')
export class SiteStatusSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: true })
  frontendUp: boolean;

  @Column({ type: 'boolean', default: true })
  backendUp: boolean;

  @Column({ type: 'boolean', default: true })
  overallUp: boolean;

  @Column({ type: 'date' })
  lastChecked: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AllSiteLocationSchema, (location) => location.siteStatus, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'siteId' })
  siteLocation?: AllSiteLocationSchema;
}
