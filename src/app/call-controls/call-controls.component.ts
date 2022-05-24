import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  RtcService,
  ParticipantService,
  SocketService,
  StreamService,
  CommonService,
} from '../services';

import {NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss']
})
export class CallControlsComponent implements OnInit {

  constructor(
    private rtcService: RtcService,
    private router: Router,
    private participantService: ParticipantService,
    private modalService: NgbModal,
    private socketService: SocketService,
    private streamService: StreamService,
    private commonService: CommonService,
  ) { }

  callId;
  participants;
  currentUser;
  isChatToggled = false;

  ngOnInit(): void {
    this.socketService.listenEvent('call-received', (data) => {
      console.log({ data });
      console.log('call-received');
      this.answerCall(data);
    });
  }

  async createCallDocForCollection(userSocketId): Promise<any> {
    return new Promise((resolve, _reject) => {
      this.socketService.sendEvent('create-call-doc', { userSocketId }, (result) => {
        resolve(result);
      });
    });
  }

  async initiateCreateCall(userSocketId) {
    const callDoc = await this.createCallDocForCollection(userSocketId);
    // const offerCandidates = callDoc.collection('offerCandidates');
    // const answerCandidates = callDoc.collection('answerCandidates');

    console.log({ callDoc });
    this.callId = callDoc.id;

    const pc = this.rtcService.getPeerConnection();
    const pc2 = this.rtcService.getPeerConnection2();

    // // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      console.log('Ice candidate event received');
      event.candidate && this.socketService.sendEvent('add-offer-candidate', {
        candidate: event.candidate.toJSON(),
        id: callDoc.id,
      }, () => {});
    };

    // // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    // // Create offer
    const offerDescription2 = await pc2.createOffer();
    await pc2.setLocalDescription(offerDescription2);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    const offer2 = {
      sdp: offerDescription2.sdp,
      type: offerDescription2.type,
    };

    console.log('Offer created and stored in redis');
    this.socketService.sendEvent('add-offer', { offer, id: callDoc.id, userSocketId, offer2 }, () => {
    });

    // Listen for remote answer
    this.socketService.listenEvent('on-answer-received', (data) => {
      console.log('on-answer-received');
      console.log({ data });
      const { answer, answer2 } = data;
      console.log({ answer });
      // this.commonService.setIsCalling(false);
      console.log('Current Remote description');
      console.log(pc.currentRemoteDescription);
      if (!pc.currentRemoteDescription && answer) {
        console.log('On answer and !currentRemoteDescription');
        const answerDescription = new RTCSessionDescription(answer);
        pc.setRemoteDescription(answerDescription);
      }
      if (!pc2.currentRemoteDescription && answer2) {
        console.log('On answer and !currentRemoteDescription');
        const answerDescription = new RTCSessionDescription(answer2);
        pc2.setRemoteDescription(answerDescription);
      }
    });


    // When answered, add candidate to peer connection
    this.socketService.listenEvent('on-answer-candidate-received', (data) => {
      console.log('on-answer-candidate-received');
      const { answerCandidate } = data;
      console.log(answerCandidate);
      const candidate = new RTCIceCandidate(answerCandidate);
      pc.addIceCandidate(candidate);
      pc2.addIceCandidate(candidate);
    });

    this.commonService.setIsCalling(true);
  }

  open(content) {
    this.currentUser = this.participantService.getCurrentUser();
    this.socketService.getEvent('get-connected-users', (data) => {
      this.participants = data;
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        if (result === 'Save click') return;
        const socketIdToConnectWith = result;
        this.initiateCreateCall(socketIdToConnectWith)
          .then((result) => {
            console.log({ result });
          })
          .catch(console.log);
      }, (reason) => {
        console.log(`Dismissed ${reason}`);
      });
    })
  }

  async answerCall(callDoc: any) {
    const callId = callDoc.id;
    const pc = this.rtcService.getPeerConnection();
    const pc2 = this.rtcService.getPeerConnection2();
    console.log(`Answering call ${callId}`);

    let numberOfIceCandidatesReceived = 1;

    pc.onicecandidate = (event) => {
      console.log('On Ice candidate');
      numberOfIceCandidatesReceived ++;
      console.log({ candidate: event.candidate && event.candidate.toJSON() });
      console.log({ numberOfIceCandidatesReceived });

      event.candidate && this.socketService.sendEvent('add-answer-candidate', {
        candidate: event.candidate.toJSON(),
        id: callDoc.id,
      }, () => {});
    };

    console.log('Fetch call data from redis');
    console.log({ callDoc });

    console.log('Setting SDP on offer 1');
    const offerDescription = callDoc.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
    console.log('Setting SDP on offer 2');
    const offerDescription2 = callDoc.offer2;
    await pc2.setRemoteDescription(new RTCSessionDescription(offerDescription2));
    
    console.log('Setting answer desc on offer 1');
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
    
    console.log('Setting answer desc on offer 2');
    const answerDescription2 = await pc2.createAnswer();
    await pc2.setLocalDescription(answerDescription2);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    const answer2 = {
      type: answerDescription2.type,
      sdp: answerDescription2.sdp,
    };

    this.socketService.sendEvent('add-answer', { answer, answer2, id: callDoc.id }, () => {
    });

    this.socketService.listenEvent('on-offer-candidate-received', (data) => {
      console.log('on-offer-candidate-received');
      console.log({ data });
      const { offerCandidate } = data;
      const candidate = new RTCIceCandidate(offerCandidate);
      pc.addIceCandidate(candidate);
    });
  }

  async openChat() {
    this.isChatToggled = !this.isChatToggled;
    this.commonService.setIsChatToggled(this.isChatToggled);
  }

  requestScreenShare() {
    return (<any> navigator.mediaDevices).getDisplayMedia({
      video: {
        cursor: 'always',
      },
      audio: false,
    });
  }

  async openScreenShare() {
    this.requestScreenShare().then((stream) => {
      console.log(stream);

      this.streamService.getLocalStreamTracks().forEach((track) => {
        console.log(`LOCAL TRACK ========>`);
        console.log(track);
        this.rtcService.getPeerConnection().addTrack(track, this.streamService.getScreenShareStream());
      });

      const videoTracks = this.streamService.getLocalStream().getVideoTracks();
      console.log({ videoTracks });

      if (videoTracks && videoTracks.length) {
        videoTracks[0].onended = () => {
          console.log(`Video tracks ended! Screen sharing stopped`);
        }
      }
    }).catch((err) => {
      console.error(err);
    })
  }

  hangupCall() {
    this.rtcService.closePeerConnection();
    this.streamService.disconnectLocalAndRemoteStreams();
    this.router.navigate(['/']);
  }
}
