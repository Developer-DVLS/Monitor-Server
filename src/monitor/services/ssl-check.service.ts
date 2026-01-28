import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as tls from 'tls';
import { Repository } from 'typeorm';
import { SiteSSLStatusSchema } from '../entities/site-ssl-status.entity';
import { SitesSchema } from 'src/sites/entities/site.entity';
import { SmsService } from './sms.service';

@Injectable()
export class SslMonitorService {
  private readonly logger = new Logger(SslMonitorService.name);

  constructor(
    private sendCardAlert: SmsService,

    @InjectRepository(SiteSSLStatusSchema)
    private siteSSlStatusRepository: Repository<SiteSSLStatusSchema>,

    @InjectRepository(SitesSchema)
    private siteRepository: Repository<SitesSchema>,
  ) {}

  async getSslDetails(url: string): Promise<any> {
    const host = new URL(url).hostname;
    const port = 443;

    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false,
        },
        () => {
          const cert = socket.getPeerCertificate();
          if (!cert || Object.keys(cert).length === 0) {
            reject(new Error('No certificate found'));
          } else {
            socket.destroy();
            resolve(cert);
          }
        },
      );

      socket.on('error', (err) => {
        reject(new Error(`TLS connection error for ${host}: ${err.message}`));
      });
    });
  }

  calculateDaysUntilExpiry(validTo: string): number {
    const expiryDate = new Date(validTo);
    if (isNaN(expiryDate.getTime())) {
      throw new Error('Invalid expiry date format');
    }
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    if (diffMs < 0) return -1;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  async monitorAllSites(): Promise<void> {
    const sites = await this.siteRepository.find();
    const now = new Date().toISOString();

    for (const site of sites) {
      const urls = [
        site.frontend_url,
        site.backend_url,
        site.printer_url,
      ].filter(Boolean);

      for (const url of urls) {
        try {
          const cert = await this.getSslDetails(url);

          if (cert) {
            const { issuer, valid_from, valid_to } = cert;
            const daysLeft = this.calculateDaysUntilExpiry(cert.valid_to);
            let sslWarningStatus = null;
            const issuerName = issuer?.O || '--';

            if (daysLeft <= 10 && daysLeft >= 0) {
              if (!site.need_ssl_renewal) {
                this.sendCardAlert.sendAlertCard({
                  cause: 'SSL certficate expiring soon.',
                  checked_url: `${url}`,
                  incident_key: new Date().toISOString().concat(url),
                  incident_url: `${url}`,
                  length: '10 days left',
                  monitor: '',
                  monitor_url: 'https://monitor-mydvls.vercel.app/',
                  response:
                    'SSL certificate expiration days is less than 10 days.',
                  title: `SSL Renewal Alert: ${site.name}`,
                });
                const updatedSite = this.siteRepository.merge(site, {
                  ...site,
                  need_ssl_renewal: true,
                });
                await this.siteRepository.save(updatedSite);
              }
              sslWarningStatus = 'CRITICAL';
            } else if (daysLeft <= 30 && daysLeft >= 0) {
              sslWarningStatus = 'OK';
            } else if (daysLeft < 0) {
              sslWarningStatus = 'EXPIRED';
            } else {
              sslWarningStatus = 'GOOD';
            }

            const previousSiteSSLStatus =
              await this.siteSSlStatusRepository.findOne({
                where: { url },
              });

            const sslData = {
              code_name: site.code_name,
              expiryDate: valid_to,
              lastRenewedDate: valid_from,
              location: site.location,
              name: site.name,
              status: sslWarningStatus,
              url,
              expiryDays: daysLeft,
              issuer: issuerName,
              site: site,
              lastChecked: now,
            };

            if (previousSiteSSLStatus) {
              this.siteSSlStatusRepository.merge(
                previousSiteSSLStatus,
                sslData,
              );
              await this.siteSSlStatusRepository.save(previousSiteSSLStatus);
            } else {
              const newEntity = this.siteSSlStatusRepository.create(sslData);
              await this.siteSSlStatusRepository.save(newEntity);
            }
          }
        } catch (err) {
          this.logger.error(`Error monitoring ${url}: ${err.message}`);
        }
      }
    }
  }

  async findAll(): Promise<SiteSSLStatusSchema[]> {
    try {
      return await this.siteSSlStatusRepository.find({
        order: {
          name: 'ASC',
        },
      });
    } catch (error) {
      console.error('Error fetching sites status:', error);
      throw new InternalServerErrorException('Failed to fetch sites status');
    }
  }

  async clearSiteSSLStatus() {
    try {
      return await this.siteSSlStatusRepository.deleteAll();
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw new InternalServerErrorException('Failed to fetch sites');
    }
  }
}
