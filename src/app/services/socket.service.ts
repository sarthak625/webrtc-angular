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
    if (this.socket && this.socket.on) {
      console.log(`Listening to ${event}`);
      this.socket.on(event, handler);
    } else {
      console.error(`Failed to listen to ${event}`);
      setTimeout(() => this.listenEvent(event, handler), 2000);
    }
  }

  joinRoom(event: String) {
    this.socket.join(event);
  }
}
