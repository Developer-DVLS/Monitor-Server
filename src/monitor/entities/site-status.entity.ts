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

  @Column({ default: null })
  frontendlastUp: string;

  @Column({ default: null })
  backendlastDown: string;

  @Column({ default: null })
  frontendlastDown: string;

  @Column({ default: null })
  backendlastUp: string;

  @Column()
  lastChecked: string;

  @CreateDateColumn()
  createdAt: string;

  @Column({ default: 0 })
  frontend_count: number;

  @Column({ default: 0 })
  backend_count: number;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToOne(() => AllSiteLocationSchema, (location) => location.siteStatus, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'siteId' })
  siteLocation?: AllSiteLocationSchema;
}
