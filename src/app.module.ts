import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitorModule } from './monitor/monitor.module';
import { EmailService } from './monitor/services/email.service';
import { ServiceBusClientProvider } from './providers/ServiceBusClientProvider';
import { SitesModule } from './sites/sites.module';

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
    SitesModule,
  ],
  controllers: [AppController],
  providers: [AppService, ServiceBusClientProvider, EmailService],
})
export class AppModule {}
