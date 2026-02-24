import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingSchema } from './entities/setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SettingSchema)
    private settingRepo: Repository<SettingSchema>,
  ) {}

  async onModuleInit() {
    const count = await this.settingRepo.count();
    if (count === 0) {
      await this.settingRepo.save({});
    }
  }

  async findAll() {
    return await this.settingRepo.find();
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    const previousSettings = await this.settingRepo.findOne({
      where: {
        id,
      },
    });

    if (!previousSettings) throw new BadRequestException('Invalid Settings ID');

    const updatedSettings = this.settingRepo.merge(previousSettings, {
      ...updateSettingDto,
    });

    return await this.settingRepo.save(updatedSettings);
  }
}
