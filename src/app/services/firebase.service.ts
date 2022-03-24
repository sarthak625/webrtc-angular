import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
  ) { }

  app;
  db;

  initializeFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyBfDEz8khr6A4h8A1zsVIrFTCBpOvmH3hU",
      authDomain: "fir-rtc-56621.firebaseapp.com",
      projectId: "fir-rtc-56621",
      storageBucket: "fir-rtc-56621.appspot.com",
      messagingSenderId: "758530780526",
      appId: "1:758530780526:web:1ecd0335d614ee4829e57f"
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    this.db = firebase.firestore();
  }

  createDocForCollection(collectionName: string): any {
    return this.db.collection(collectionName).doc();
  }

  getCallDocById(collectionName: string, id: string) {
    return this.db.collection(collectionName).doc(id);
  }
}
