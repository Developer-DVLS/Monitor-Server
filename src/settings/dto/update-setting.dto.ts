import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty({ message: 'Send Site Status Slert is required' })
  @IsBoolean()
  send_site_status_alert: boolean;

  @IsNotEmpty({ message: 'Site Status Count Threshold is required' })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive({ message: 'Site Status Count Threshold must not be negative' })
  site_status_count_threshold: number;

  @IsNotEmpty({ message: 'Site Status Days Threshold is required' })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive({ message: 'Site Status Days Threshold must not be negative' })
  ssl_status_days_threshold: number;
}
