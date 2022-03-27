import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService, RestService } from './services';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'video-calling-app';

  constructor(
    private router: Router,
    private socketService: SocketService,
    private restService: RestService,
  ) { }

  ngOnInit(): void {
    this
        .restService
        .get(`${environment.apiServer}/jwt`)
        .subscribe((data) => {
          if (data && data.token) {
            this.socketService.connect(data.token);
          }
        });
  }
}
