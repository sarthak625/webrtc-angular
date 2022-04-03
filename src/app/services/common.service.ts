import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  isCalling$ = new BehaviorSubject<boolean>(false);
  isChatToggled$ = new BehaviorSubject<boolean>(false);
  isChatConnected = false;

  constructor() { }
  
  setIsCalling(isCalling: boolean) {
    this.isCalling$.next(isCalling);
  }

  getIsCalling() {
    return this.isCalling$;
  }

  getIsChatToggled() {
    return this.isChatToggled$;
  }

  setIsChatToggled(isChatToggled: boolean) {
    this.isChatToggled$.next(isChatToggled);
  }

  setIsChatConnected(isChatConnected: boolean) {
    this.isChatConnected = isChatConnected;
  }

  getIsChatConnected() {
    return this.isChatConnected;
  }
}
