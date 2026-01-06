import { SiteSSLStatusSchema } from 'src/monitor/entities/site-ssl-status.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sites')
export class SitesSchema {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  code_name: string;

  @Column()
  logo: string;

  @Column()
  frontend_url: string;

  @Column()
  backend_url: string;

  @Column()
  printer_url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-json', { default: '[]' })
  subLocations: string[];

  @Column({ default: 1 })
  location_id: number;

  @Column()
  created_date: string;

  @Column()
  updated_date: string;

  @OneToMany(() => SiteSSLStatusSchema, (ssl) => ssl.site, {
    cascade: true,
  })
  sslStatuses: SiteSSLStatusSchema[];
}
