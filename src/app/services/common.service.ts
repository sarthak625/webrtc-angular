import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  isCalling$ = new BehaviorSubject<boolean>(false);
  constructor() { }
  
  setIsCalling(isCalling) {
    this.isCalling$.next(isCalling);
  }

  getIsCalling() {
    return this.isCalling$;
  }
}
