import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  pc;
  pc2;
  chatChannel;

  constructor() {
  }

  initializeRTC() {
    this.pc = new RTCPeerConnection(environment.servers);
    this.pc2 = new RTCPeerConnection(environment.servers);
    return {
      pc: this.pc,
      pc2: this.pc2,
    };
  }

  getPeerConnection() {
    return this.pc;
  }
  
  getPeerConnection2() {
    return this.pc;
  }

  closePeerConnection() {
    return this.pc.close();
  }
  
  closePeerConnection2() {
    return this.pc.close();
  }

  createChatChannel(pc) {
    const params = { ordered: true };
    console.log('Trying to create chat-channel');
    let peerConnection = pc || this.pc;
    if (peerConnection) {
      this.chatChannel = peerConnection.createDataChannel('messaging-channel', params);
      this.chatChannel.binaryType = 'arraybuffer';
      console.log('chat-channel');
      console.log({c: this.chatChannel});
    }
  }

  getChatChannel() {
    return this.chatChannel;
  }

  addChatEventListener(eventName: string, handler: Function) {
    console.log(`Added event listener for > ${eventName}`);
    if (this.chatChannel) {
      this.chatChannel.addEventListener(eventName, handler);
    }
  }

  sendChatMessage(message: string) {
    if (this.chatChannel) {
      this.chatChannel.send(message);
    }
  }

  listenToRemoteChatChannel(handler: Function) {
    console.log('Peer connection');
    console.log(this.pc);
    this.pc.ondatachannel = handler;
  }
}
