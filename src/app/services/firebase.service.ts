import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
  ) { }

  app;
  db;

  initializeFirebase() {
    if (!firebase.apps.length) {
      firebase.initializeApp(environment.firebase);
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
