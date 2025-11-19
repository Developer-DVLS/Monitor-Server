import { ServiceBusClient } from '@azure/service-bus';

export const createServiceBusClient = (connectionString: string) => {
  return new ServiceBusClient(connectionString);
};
