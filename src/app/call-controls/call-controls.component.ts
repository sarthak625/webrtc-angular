import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FirebaseService, RtcService } from '../services';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss']
})
export class CallControlsComponent implements OnInit {

  constructor(
    private firebaseService: FirebaseService,
    private rtcService: RtcService,
    private router: Router,
  ) { }

  callId;

  ngOnInit(): void {
  }

  async initiateCreateCall() {
    const callDoc = this.firebaseService.createDocForCollection('calls');
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');

    this.callId = callDoc.id;

    const pc = this.rtcService.getPeerConnection();
    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      console.log('Ice candidate event received');
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    console.log('Offer created and stored in firestore');
    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      console.log('Answer received');
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      console.log('Answer candidate received');
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    Swal.fire(`You have initiated a call with call id: ${this.callId}`);

  }

  async initiateJoinCall() {
    const data = await Swal.fire({
      title: 'Enter call id',
      input: 'text', inputPlaceholder: 'Call Id'
    });
    const callId = data?.value?.trim();

    if (!callId) {
      Swal.fire(
        'Error',
        'You need to enter callId to join a call',
        'error'
      )
      return;
    }

    const pc = this.rtcService.getPeerConnection();
    console.log(`Answering call ${callId}`);
    const callDoc = this.firebaseService.getCallDocById('calls', callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    pc.onicecandidate = (event) => {
      console.log('On Ice candidate');
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    console.log('Fetch call data from firestore');

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  hangupCall() {
    this.router.navigate(['/']);
  }
}
