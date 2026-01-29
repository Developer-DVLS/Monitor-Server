import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingSchema } from './entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettingSchema])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
