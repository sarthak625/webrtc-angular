import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  constructor(private httpClient: HttpClient) {}

  get(url, options: any = {}): Observable<any> {
    return this.httpClient.get(url, options);
  }

  post(url: string, body: any | null, options: any = {}) {
    return this.httpClient.post(url, body, options);
  }

  put(url: string, body: any | null, options: any = {}) {
    return this.httpClient.put(url, body,options);
  }

  delete(url: string, options: any = {}) {
    return this.httpClient.delete(url, options);
  }
}
