import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FE_APP_HOST,
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'http://localhost:8090',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SettlementsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log(payload);
    client.emit('foo', [
      { lat: 53.4519058, lng: 14.516832 },
      { lat: 53.4619058, lng: 14.516832 },
      { lat: 53.4719058, lng: 14.516832 },
    ]);
    return 'Hello websocket world!';
  }

  @SubscribeMessage('message')
  onEvent(client: any, payload: any): Observable<WsResponse<any>> | any {
    this.server.emit('message', payload);
  }
}
