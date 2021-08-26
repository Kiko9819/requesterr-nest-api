import { Injectable, Logger } from '@nestjs/common';
import { ClientOptions, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private client: ClientProxy;
  private logger = new Logger('Main');

  constructor() {
    const microservicesOptions: ClientOptions = {
      transport: Transport.REDIS,
      options: {
        url: 'redis://localhost:6379'
      }
    };
    this.client = ClientProxyFactory.create(microservicesOptions);
  }

  getHello() {
    this.logger.log('Getting hello from microservice');
    return this.client.send<string, any>('say-hi', {});
  }
}