import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MonitorModule } from './monitor/monitor.module';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorController } from './monitor/monitor.controller';
import { EmailService } from './monitor/services/email.service';
import { ServiceBusClientProvider } from './providers/ServiceBusClientProvider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'site-status.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MonitorModule,
  ],
  controllers: [AppController, MonitorController],
  providers: [AppService, ServiceBusClientProvider, EmailService],
})
export class AppModule {}
