import { Controller, Get } from '@nestjs/common';

@Controller('monitor')
export class MonitorController {
  @Get()
  getResponse() {
    return 'monitor api route';
  }
}
