import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios'; // For better error typing
import { SiteStatusSchema } from '../entities/site-status.entity';
import { AlertCardPayload } from 'src/types/alret';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async sendAlertCard(
    status: SiteStatusSchema,
    payload: AlertCardPayload,
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.get('SMS_MYDVLS') + '/teams_alerts/notify',
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          },
        ),
      );
      if (response.status >= 200 && response.status < 300) {
        this.logger.log(
          `Card request sent successfully for site ${status.siteLocation.name}`,
        );
      } else {
        this.logger.warn(
          `SMS API responded with status ${response.status} for site ${status.siteLocation.name}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send SMS for site ${status.siteLocation.name}:`,
        error,
      );
      console.log('this is error', error);
      if (error instanceof AxiosError) {
        this.logger.error(
          `HTTP Error: ${error.response?.status} - ${error.response?.data || error.message}`,
        );
      }
    }
  }

  async sendAlert(
    status: SiteStatusSchema,
    type: 'Recovery' | 'Alert',
    sendToPhone: string,
  ): Promise<void> {
    const message =
      type === 'Recovery'
        ? `🎉 Site ${status.siteLocation.name} Back Online!\nFrontend: ${status.frontendUp ? 'UP 🟢' : 'DOWN 🔴'}\nBackend: ${status.backendUp ? 'UP 🟢' : 'DOWN 🔴'}\nRecoverd At: ${status.lastChecked.toISOString()}`
        : `🚨 Site ${status.siteLocation.name} DOWN!\nFrontend: ${status.frontendUp ? 'UP 🟢' : 'DOWN 🔴'}\nBackend: ${status.backendUp ? 'UP 🟢' : 'DOWN 🔴'}\nChecked: ${status.lastChecked.toISOString()}`;

    const payload = {
      message,
      message_to: sendToPhone,
      message_from_service: 1,
      schedule: false,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.config.get('SEND_MESSAGE'), payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
      if (response.status >= 200 && response.status < 300) {
        this.logger.log(
          `SMS request sent successfully for site ${status.siteLocation.name} to ${sendToPhone}`,
        );
      } else {
        this.logger.warn(
          `SMS API responded with status ${response.status} for site ${status.siteLocation.name}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send SMS for site ${status.siteLocation.name}:`,
        error,
      );
      console.log('this is error', error);
      if (error instanceof AxiosError) {
        this.logger.error(
          `HTTP Error: ${error.response?.status} - ${error.response?.data || error.message}`,
        );
      }
    }
  }
}
