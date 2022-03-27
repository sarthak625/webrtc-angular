import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  pc;
  constructor() {
  }

  initializeRTC() {
    this.pc = new RTCPeerConnection(environment.servers);
    return this.pc;
  }

  getPeerConnection() {
    return this.pc;
  }

  closePeerConnection() {
    return this.pc.close();
  }
}
