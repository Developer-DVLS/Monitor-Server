import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-json', { default: '[]' })
  subLocations: string[];

  @Column({ default: '1' })
  locationId: string;

  @Column()
  created_date: string;

  @Column()
  updated_date: string;
}
