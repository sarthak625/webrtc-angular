import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  localStream: MediaStream;
  remoteStream: MediaStream;
  constructor() {

  }

  getLocalStream() {
    return this.localStream;
  }
  
  setLocalStream(stream) {
    this.localStream = stream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  setRemoteStream(stream) {
    this.remoteStream = stream;
  }

  getLocalStreamTracks() {
    return this.localStream.getTracks();
  }
  
  getRemoteStreamTracks() {
    return this.remoteStream.getTracks();
  }
  
  setRemoteStreamTrack(track) {
    return this.remoteStream.addTrack(track);
  }

  disconnectLocalAndRemoteStreams() {
    if (this.getLocalStream()) {
      this.getLocalStreamTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (this.getRemoteStream()) {
      this.getRemoteStreamTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
  }
}
