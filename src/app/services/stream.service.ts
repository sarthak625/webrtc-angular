import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  localStream: MediaStream;
  remoteStream: MediaStream;
  screenShareStream: MediaStream;

  constructor() {
  }

  getLocalStream() {
    return this.localStream;
  }
  
  setLocalStream(stream) {
    this.localStream = stream;
  }

  setScreenShareStream(stream) {
    this.screenShareStream = stream;
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

  getScreenShareStream() {
    return this.screenShareStream;
  }

  getScreenShareStreamTracks() {
    return this.screenShareStream.getTracks();
  }
  
  setRemoteStreamTrack(track) {
    return this.remoteStream.addTrack(track);
  }
  
  setShareStreamTrack(track) {
    return this.screenShareStream.addTrack(track);
  }

  disconnectLocalAndRemoteStreams() {
    if (this.getLocalStream()) {
      this.getLocalStreamTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (this.getRemoteStream()) {
      this.getRemoteStreamTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (this.getScreenShareStream()) {
      this.getScreenShareStreamTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
  }
}
