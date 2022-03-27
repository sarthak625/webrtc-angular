import { Component, OnInit, NgZone, ElementRef, Renderer2, OnDestroy, ViewChild } from '@angular/core';
import {
  FirebaseService,
  RtcService,
  SocketService,
  ParticipantService,
  StreamService,
  CommonService,
} from '../services';

import {NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-onetoonecall',
  templateUrl: './onetoonecall.component.html',
  styleUrls: ['./onetoonecall.component.scss']
})
export class OnetoonecallComponent implements OnInit, OnDestroy {

  constructor(
    private ngZone: NgZone,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private firebaseService: FirebaseService,
    private rtcService: RtcService,
    private socketService: SocketService,
    private participantService: ParticipantService,
    private streamService: StreamService,
    private commonService: CommonService,
    private modalService: NgbModal,
  ) { }

  @ViewChild('callingmodal') myModal : any;

  video = {
    srcObject: null,
  };

  remoteViewTop = '2px';
  remoteViewLeft = '2px';

  isBeingDragged = false;
  hasAllowedVideoAudioPermission = false;

  disallowSwalFire = false;
  isCalling = true;

  async requestForNameUntilProvided(hasRequestedBefore) {
    if (this.disallowSwalFire) return;
    let title = 'Please enter your name';
    if (hasRequestedBefore) {
      title = 'You need to enter your name to continue'; 
    }
    let data = await Swal.fire({
      title,
      input: 'text', inputPlaceholder: 'Your name here'
    });

    if (!data.value) {
      data = await this.requestForNameUntilProvided(true);
    }

    this.commonService.getIsCalling().subscribe((data) => {
      console.log('Is calling changed');
      console.log({ data });
      if (data) {
        this.modalService.open(this.myModal, { centered: true, modalDialogClass: 'dark-modal' });
      }
    });
    return data;
  }

  assignVideoStreamToElementId(elementId: string, stream, isMuted: Boolean) {
    const player = this.elRef.nativeElement.querySelector(elementId);
    player.srcObject = stream;
    if (isMuted) {
      player.muted = true;
    }
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

    this.streamService.setLocalStream(stream);
    this.streamService.setRemoteStream(new MediaStream());

    // Push tracks from local stream to peer connection
    this.streamService.getLocalStreamTracks().forEach((track) => {
      pc.addTrack(track, this.streamService.getLocalStream());
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (this.streamService.getRemoteStream()) {
          console.log('Remote stream received');
          this.streamService.setRemoteStreamTrack(track);
        }
      });
    };

    this.assignVideoStreamToElementId('#self-view-element', this.streamService.getLocalStream(), true);
    this.assignVideoStreamToElementId('#remote-view-element', this.streamService.getRemoteStream(), false);

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
    this
    .requestForNameUntilProvided(false)
    .then((data) => {
        if (!data) return;
        this.socketService.sendEvent('join-call', {
          value: data.value
        }, (response) => {
          this.participantService.setCurrentUser(response);
        });
      });
    if (this.hasUserMedia()) {
      this.requestForCameraAndMicPermissionsUntilProvided();
    }
  }

  open(content) {
    console.log('content');
    console.log(content);

    console.log(this.elRef.nativeElement.querySelector('#callingmodal'));
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      }, (reason) => {
        console.log(`Dismissed ${reason}`);
      });
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

  ngOnDestroy(): void {
    this.disallowSwalFire = true;
    this.streamService.disconnectLocalAndRemoteStreams();
  }

}
