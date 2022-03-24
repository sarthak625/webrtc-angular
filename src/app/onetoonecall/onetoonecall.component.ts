import { Component, OnInit, NgZone, ElementRef, Renderer2 } from '@angular/core';
import { FirebaseService, RtcService } from '../services';

@Component({
  selector: 'app-onetoonecall',
  templateUrl: './onetoonecall.component.html',
  styleUrls: ['./onetoonecall.component.scss']
})
export class OnetoonecallComponent implements OnInit {

  constructor(
    private ngZone: NgZone,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private firebaseService: FirebaseService,
    private rtcService: RtcService,
  ) { }

  video = {
    srcObject: null,
  };

  remoteViewTop = '2px';
  remoteViewLeft = '2px';

  isBeingDragged = false;
  hasAllowedVideoAudioPermission = false;

  localStream;
  remoteStream;

  assignVideoStreamToElementId(elementId: string, stream) {
    const player = this.elRef.nativeElement.querySelector(elementId);
    player.srcObject = stream;
    player.load();
  }

  requestForCameraAndMicrophone() {
    console.log('req for cam and mic')
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  }

  hasUserMedia() {
    return navigator?.mediaDevices?.getUserMedia;
  }

  handlePermissionsProvided(stream) {
    this.hasAllowedVideoAudioPermission = true;
    const pc = this.rtcService.initializeRTC();
    this.firebaseService.initializeFirebase();

    this.localStream = stream;
    this.remoteStream = new MediaStream();
    // Push tracks from local stream to peer connection
    this.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (this.remoteStream) {
          console.log('Remote stream received');
          this.remoteStream.addTrack(track);
        }
      });
    };

    this.assignVideoStreamToElementId('#self-view-element', this.localStream);
    this.assignVideoStreamToElementId('#remote-view-element', this.remoteStream);

  }

  requestForCameraAndMicPermissionsUntilProvided() {
    console.log('here');
    this.requestForCameraAndMicrophone()
    .then((stream) => {
      this.handlePermissionsProvided(stream);
    })
    .catch((err) => {
      console.log(err);
      this.hasAllowedVideoAudioPermission = false;
      // Request permissions again after 5s
      setTimeout(() => {
        this.requestForCameraAndMicPermissionsUntilProvided();
      }, 5000);
    });
  }

  ngOnInit(): void {
    if (this.hasUserMedia()) {
      this.requestForCameraAndMicPermissionsUntilProvided();
    }
  }

  onDragStart(event: any) {
    this.isBeingDragged = true;
    console.log(event.x);
  }
  
  onDrag(event: any) {
    const y = Number(event.y);
    const x = Number(event.x);

    console.log(`new position of div is x=${x} and y = ${y}`)
    this.assignHeightAndWidthIfWithinScreenSize(x, y);
  }
  
  onDragEnd(event: any) {
    this.isBeingDragged = false;
    const y = Number(event.y);
    const x = Number(event.x);

    console.log(`new position of div is x=${x} and y = ${y}`)
    this.assignHeightAndWidthIfWithinScreenSize(x, y);
  }

  assignHeightAndWidthIfWithinScreenSize(x, y) {
    const height = window.screen.height - 100;
    const width = window.screen.width - 100;
    if (x <= width && y <= height) {
      this.remoteViewLeft = `${x}px`;
      this.remoteViewTop = `${y}px`;
    }
  }

}
