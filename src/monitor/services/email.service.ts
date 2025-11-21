import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import { SiteStatusSchema } from '../entities/site-status.entity';

@Injectable()
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private sender: ServiceBusSender;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly serviceBusClient: ServiceBusClient) {}

  async onModuleInit() {
    this.sender = this.serviceBusClient.createSender('singlesitequeue');
  }

  async sendMessage(
    siteDetails: SiteStatusSchema,
    type: 'Recovery' | 'Alert',
    sendToEmail: string | string[],
  ): Promise<void> {
    const isAlert = type === 'Alert';
    try {
      await this.sender.sendMessages({
        body: {
          message: 'Norbus Site Server Alert',
          service_type: 'email',
          to_email: sendToEmail,
          subject: isAlert
            ? `🚨 CRITICAL: ${siteDetails.site.name} ${!siteDetails.backendUp && !siteDetails.backendUp ? `(Frontend & Backend)` : siteDetails.backendUp ? 'Frontend' : 'Backend'}  DOWN - Immediate Action Required!`
            : `🎉 Site Recovery: ${siteDetails.site.name} Server Online`,
          content: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: ${isAlert ? '#dc3545' : '#28a745'}; color: white; padding: 15px; text-align: center; }
            .status-down { color: #dc3545; font-weight: bold; }
            .status-up { color: #28a745; font-weight: bold; }
            .alert-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .action-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 10px; margin: 10px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d; margin-top: 20px; }
          </style>
        </head>
        <body>
        ${
          isAlert
            ? `
        <div class="header">
          <h1>${siteDetails.site.name} ${!siteDetails.backendUp && !siteDetails.backendUp ? `(Frontend & Backend)` : siteDetails.backendUp ? 'Frontend' : 'Backend'} Incident Detected</h1>
        </div>`
            : `
        <div class="header">
          <h1>SITE Online: Norbus Server Back To Online</h1>
        </div>
        `
        }

        ${
          isAlert
            ? `
        <div class="alert-box">
          <h2>Site Overview</h2>
          <p>Issue Deletected URLs</p>
        ${
          !siteDetails.frontendUp
            ? `
         <p><strong>Check Frontend URL:</strong> <a href="${siteDetails.site.frontend_url}" target="_blank" style="color: #007bff;">${siteDetails.site.frontend_url}</a></p>
        `
            : ``
        }
        ${
          !siteDetails.backendUp
            ? `
         <p><strong>Check Backend URL:</strong> <a href="${siteDetails.site.backend_url}" target="_blank" style="color: #007bff;">${siteDetails.site.backend_url}</a></p>
        `
            : ``
        }
         
        </div>
        `
            : ``
        }

          <h2>Service Status</h2>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>URL</th>
                <th>Last Check</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Frontend</strong></td>
                ${
                  siteDetails.frontendUp
                    ? `
                <td><span class="status-up">UP 🟢</span></td>
                `
                    : `
                <td><span class="status-down">DOWN 🔴</span></td>
                `
                }
                <td><a href="${siteDetails.site.frontend_url}" target="_blank">Frontend URL</a></td>
                <td rowspan="2">${siteDetails.lastChecked.toISOString()}</td>
              </tr>
              <tr>
                <td><strong>Backend</strong></td>
                ${
                  siteDetails.backendUp
                    ? `
                <td><span class="status-up">UP 🟢</span></td>
                `
                    : `
                <td><span class="status-down">DOWN 🔴</span></td>
                `
                }
                <td><a href="${siteDetails.site.backend_url}" target="_blank">Backend URL</a></p></td>
              </tr>
            </tbody>
          </table>

         

          
          <div class="footer">
            <p>This is an automated alert from MonitorMydvls. Do not reply to this email.</p>
            <p>For support: Contact at support@mydvls.com | Dashboard: <a href="https://monitor-mydvls.vercel.app/" target="_blank">Monitoring Dashboard</a></p>
          </div>
        </body>
      </html>
    `,
        },
      });
      this.logger.log(`Successfully Send Email to ${sendToEmail}`);
    } catch (error) {
      console.error('Failed to send message to Service Bus:', error);
      this.logger.log(error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.sender.close();
  }
}

//  ${
//             isAlert
//               ? `
//           <div class="action-box">
//             <h2>Recommended Actions</h2>
//             <ol>
//               <li><strong>Verify Alert:</strong> Manually check the site URL and backend endpoints (e.g., /auth/).</li>
//               <li><strong>Investigate Logs:</strong> Review server logs on Azure for errors around ${siteDetails.lastChecked.toISOString()}.</li>
//               <li><strong>Restart Services:</strong> Attempt to restart frontend (e.g., PM2/Nginx) and backend (e.g., Django/Nginx) processes.</li>
//               <li><strong>Check Dependencies:</strong> Validate database connectivity and any third-party services.</li>
//               <li><strong>Escalate if Needed:</strong> If unresolved in 15 mins, notify on-call Individual.</li>
//             </ol>
//             <p><em>Monitoring Tool:</em> Automated health check cronjob (Ping/HTTP probe every 30secs).</p>
//           </div>
//           `
//               : ''
//           }
