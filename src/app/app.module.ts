import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { LoaderComponent } from './loader/loader.component';
import { FooterComponent } from './footer/footer.component';
import { OnetoonecallComponent } from './onetoonecall/onetoonecall.component';
import { GroupcallComponent } from './groupcall/groupcall.component';
import { CallControlsComponent } from './call-controls/call-controls.component';
import { HttpClientModule } from  '@angular/common/http';
import { SocketService } from './services';

import { environment } from 'src/environments/environment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CallingComponent } from './calling/calling.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoaderComponent,
    FooterComponent,
    OnetoonecallComponent,
    GroupcallComponent,
    CallControlsComponent,
    CallingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
  ],
  providers: [
    SocketService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
