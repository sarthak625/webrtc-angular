import { Injectable } from '@angular/core';

import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket;
  constructor() { }

  connect(token: string) {
    this.socket = io(environment.socketServer, {
      auth: {
        token,
      }
    });
  }

  sendEvent(event: string, data: Object, handler: Function) {
    this.socket.emit(event, data, handler);
  }

  getEvent(event: string, handler: Function) {
    this.socket.emit(event, handler);
  }

  listenEvent(event: String, handler: Function) {
    console.log(event);
    this.socket.on(event, handler);
  }

  joinRoom(event: String) {
    this.socket.join(event);
  }
}
