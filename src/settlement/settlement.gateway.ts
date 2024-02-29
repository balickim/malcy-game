import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Observable } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: ['https://localhost', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class SettlementGateway {
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
