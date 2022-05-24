import {
  Component,
  OnInit,
  NgZone,
  ElementRef,
  Renderer2,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import {
  RtcService,
  SocketService,
  ParticipantService,
  StreamService,
  CommonService,
} from '../services';

import {NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
    private rtcService: RtcService,
    private socketService: SocketService,
    private participantService: ParticipantService,
    private streamService: StreamService,
    private commonService: CommonService,
    private modalService: NgbModal,
  ) { }

  @ViewChild('callingmodal') myModal : any;
  @ViewChild('chatArea') chatArea: ElementRef;

  video = {
    srcObject: null,
  };

  remoteViewTop = '2px';
  remoteViewLeft = '2px';

  isBeingDragged = false;
  hasAllowedVideoAudioPermission = false;

  disallowSwalFire = false;
  isCalling = true;

  modalReference: NgbModalRef;
  isChatToggled = false;

  messageInput: string = '';
  isScreenShareRunning = false;

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

    this.commonService.getIsChatToggled().subscribe((data) => {
      console.log({ 'this.isChatToggled': data });
      // this.ngZone.run(() => {
        this.isChatToggled = data;
      // });
    });
  }

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
        this.modalReference = this.modalService.open(this.myModal, { centered: true, modalDialogClass: 'dark-modal' });
      } else {
        if (this.modalReference) {
          this.modalReference.close();
        }
      }
    });
    return data;
  }

  assignVideoStreamToElementId(elementId: string, stream, isMuted: Boolean) {
    const player = this.elRef.nativeElement.querySelector(elementId);
    console.log({ player });
    player.srcObject = stream;
    if (isMuted) {
      player.muted = true;
    }
    player.load();
  }

  requestForCameraAndMicrophone() {
    console.log('req for cam and mic')
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: {
          exact: 1280,
        },
        height: {
          exact: 720,
        }
      },
      audio: true,
    });
  }

  hasUserMedia() {
    return navigator?.mediaDevices?.getUserMedia;
  }

  initializeChat(pc) {
    try {
      this.rtcService.createChatChannel(pc);
  
      this.rtcService.listenToRemoteChatChannel((event) => {
        console.log('Listening to remote channel');
        console.log(event);

        const data = event.channel;
        data.onmessage = (evt) => {
          console.log('on message');
          console.log(evt);
          console.log(evt.data);

          const chatArea = this.chatArea.nativeElement;
          const div = this.renderer.createElement('div');
          const text = this.renderer.createText(evt.data);
          this.renderer.addClass(div, 'text-msg');
          this.renderer.addClass(div, 'text-remote');
          this.renderer.appendChild(div, text);
          this.renderer.appendChild(chatArea, div);
        }

        data.onopen = (evt) => {
          console.log('On open');
          console.log(evt);

          console.log('state');
          this.commonService.setIsChatConnected(data.readyState === 'open');
          console.log(data.readyState);
        }

        data.onclose = (evt) => {
          console.log('On close');
          console.log(evt);

          this.commonService.setIsChatConnected(data.readyState !== 'open');
          console.log('state');
          console.log(data.readyState);
        }
      })
  
      this.rtcService.addChatEventListener('message', (event) => {
        console.log(`RECEIVED message`);
        console.log(event);
      });
  
      this.rtcService.addChatEventListener('datachannel', (event) => {
        console.log(`RECEIVED datachannel`);
        console.log(event);
      });
  
      this.rtcService.addChatEventListener('open', (event) => {
        console.log(`RECEIVED open`);
        console.log(event);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async sendMessage(event: any) {
    if (event) {
      const hasPressedEnter = (!event.shiftKey && (event.key === "Enter" || event.key === "Tab"));
      if (!hasPressedEnter) return;
    }

    if (this.messageInput.trim().length === 0) {
      return;
    }
    
    if (!this.commonService.getIsChatConnected()) {
      if (event) {
        event.preventDefault();
      }
      Swal.fire({
        icon: 'error',
        title: 'Chat not connected',
        text: 'Please initiate call to start chatting',
        // footer: '<a href="">Why do I have this issue?</a>'
      })
      // Swal.fire('Chat not connected', 'Please initiate call to start chatting', 'error');
    } else {
      // console.log(this.messageInput);
      this.rtcService.sendChatMessage(this.messageInput);
      console.log(this.chatArea);
      const chatArea = this.chatArea.nativeElement;
      const div = this.renderer.createElement('div');
      const text = this.renderer.createText(this.messageInput);
      this.renderer.addClass(div, 'text-msg');
      this.renderer.addClass(div, 'text-local');
      this.renderer.appendChild(div, text);
      this.renderer.appendChild(chatArea, div);
      this.messageInput = '';
    }
  }

  handlePermissionsProvided(stream) {
    this.hasAllowedVideoAudioPermission = true;
    const { pc, pc2 } = this.rtcService.initializeRTC();
    this.initializeChat(pc);

    this.streamService.setLocalStream(stream);
    this.streamService.setRemoteStream(new MediaStream());
    this.streamService.setScreenShareStream(new MediaStream());

    // Push tracks from local stream to peer connection
    this.streamService.getLocalStreamTracks().forEach((track) => {
      console.log(`LOCAL TRACK ========>`);
      console.log(track);
      pc.addTrack(track, this.streamService.getLocalStream());
    });

    // Push tracks from local share stream to peer connection
    this.streamService.getScreenShareStreamTracks().forEach((track) => {
      console.log(`SCREEN SHARE TRACK ========>`);
      console.log(track);
      pc.addTrack(track, this.streamService.getScreenShareStream());
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      console.log(`PULL TRACK =====>`);
      console.log(event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log(`Get track`);
        console.log({ track });
        if (track.kind === 'video' && this.commonService.getIsCalling()) {
          this.commonService.setIsCalling(false);
        }
        this.streamService.setRemoteStreamTrack(track);
      });
    };
    
    // Pull tracks from remote stream, add to video stream
    pc2.ontrack = (event) => {
      console.log(`PULL TRACK =====>`);
      console.log(event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log(`Get track`);
        console.log({ track });
        this.streamService.setShareStreamTrack(track);
      });
    };

    this.assignVideoStreamToElementId('#self-view-element', this.streamService.getLocalStream(), true);
    this.assignVideoStreamToElementId('#remote-view-element', this.streamService.getRemoteStream(), false);
    this.assignVideoStreamToElementId('#screen-share-view-element', this.streamService.getScreenShareStream(), false);
  }

  requestForCameraAndMicPermissionsUntilProvided() {
    console.log('here');
    this.requestForCameraAndMicrophone()
    .then((stream) => {
      try {
        this.handlePermissionsProvided(stream);
      } catch (err) {
        console.error(err);
      }
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
