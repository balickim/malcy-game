import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import {
  IUpdateLocationParams,
  UserLocationService,
} from '~/models/user-location/user-location.service';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FE_APP_HOST,
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'http://localhost:5173',
      'http://localhost:8090',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class UserLocationGateway {
  private readonly logger = new Logger(UserLocationGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(private userLocationService: UserLocationService) {}

  @SubscribeMessage('position')
  async handleMessage(client: any, payload: IUpdateLocationParams) {
    try {
      await this.userLocationService.updateLocation(payload);
    } catch (e) {
      this.logger.error(
        `ERROR UPDATING LOCATION FOR USER: ${payload.userId} --- ${e}`,
      );
      return client.emit('location:error', e.message);
    }
    this.logger.debug(`LOCATION UPDATED FOR USER: ${payload.userId}`);
    return 'location updated';
  }
}
