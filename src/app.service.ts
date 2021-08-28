import { Injectable } from '@nestjs/common';
import { ClientOptions, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { take } from 'rxjs';

@Injectable()
export class AppService {
  private client: ClientProxy;

  constructor() {
    const microservicesOptions: ClientOptions = {
      transport: Transport.REDIS,
      options: {
        url: 'redis://localhost:6379'// TODO make use of config service and get this from env
      }
    };
    this.client = ClientProxyFactory.create(microservicesOptions);
  }

  getToken(id) {
    return this.client.send('get-token', id).pipe(
      take(1)
    )
  }

  setToken(key, value) {
    return this.client.send('set-token', {key, value}).pipe(
      take(1)
    )
  }

  deleteToken(key) {
    return this.client.send('delete-token', key).pipe(
      take(1)
    );
  }
}