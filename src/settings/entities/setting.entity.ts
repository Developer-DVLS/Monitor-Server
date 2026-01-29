import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class SettingSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  send_site_status_alert: boolean;

  @Column({ default: 2 })
  site_status_count_threshold: number;

  @Column({ default: 10 })
  ssl_status_days_threshold: number;
}
