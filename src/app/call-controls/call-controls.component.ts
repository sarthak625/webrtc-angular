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

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    console.log('Offer created and stored in redis');
    this.socketService.sendEvent('add-offer', { offer, id: callDoc.id, userSocketId }, () => {
    });

    // Listen for remote answer
    this.socketService.listenEvent('on-answer-received', (data) => {
      console.log('on-answer-received');
      console.log({ data });
      const { answer } = data;
      console.log({ answer });
      // this.commonService.setIsCalling(false);
      console.log('Current Remote description');
      console.log(pc.currentRemoteDescription);
      if (!pc.currentRemoteDescription && answer) {
        console.log('On answer and !currentRemoteDescription');
        const answerDescription = new RTCSessionDescription(answer);
        pc.setRemoteDescription(answerDescription);
      }
    });


    // When answered, add candidate to peer connection
    this.socketService.listenEvent('on-answer-candidate-received', (data) => {
      console.log('on-answer-candidate-received');
      const { answerCandidate } = data;
      console.log(answerCandidate);
      const candidate = new RTCIceCandidate(answerCandidate);
      pc.addIceCandidate(candidate);
    });

    this.commonService.setIsCalling(true);
  }

  open(content) {
    this.currentUser = this.participantService.getCurrentUser();
    this.socketService.getEvent('get-connected-users', (data) => {
      this.participants = data;
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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

  async initiateJoinCall() {

  }

  async answerCall(callDoc: any) {
    const callId = callDoc.id;
    const pc = this.rtcService.getPeerConnection();
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

    const offerDescription = callDoc.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    this.socketService.sendEvent('add-answer', { answer, id: callDoc.id }, () => {
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

  hangupCall() {
    this.rtcService.closePeerConnection();
    this.streamService.disconnectLocalAndRemoteStreams();
    this.router.navigate(['/']);
  }
}
