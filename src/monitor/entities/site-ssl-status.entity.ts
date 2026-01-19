import { SitesSchema } from 'src/sites/entities/site.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('site_ssl_status')
export class SiteSSLStatusSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  code_name: string;

  @Column({ unique: true })
  url: string;

  @Column()
  lastRenewedDate: string;

  @Column()
  expiryDate: string;

  @Column()
  expiryDays: number;

  @Column()
  issuer: string;

  @Column()
  status: 'CRITICAL' | 'OK' | 'GOOD' | 'EXPIRED';

  @ManyToOne(() => SitesSchema, (site) => site.sslStatuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'siteId' })
  site: SitesSchema;
}
