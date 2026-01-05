import { ServiceBusClient } from '@azure/service-bus';
import { Provider } from '@nestjs/common';
import { createServiceBusClient } from 'src/configs/service-bus.config';

export const ServiceBusClientProvider: Provider = {
  provide: ServiceBusClient,
  useFactory: () => {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error(
        'Azure Service Bus connection string not found in environment variables.',
      );
    }
    return createServiceBusClient(connectionString);
  },
};
