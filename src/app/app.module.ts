import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { LoaderComponent } from './loader/loader.component';
import { FooterComponent } from './footer/footer.component';
import { OnetoonecallComponent } from './onetoonecall/onetoonecall.component';
import { GroupcallComponent } from './groupcall/groupcall.component';
import { CallControlsComponent } from './call-controls/call-controls.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoaderComponent,
    FooterComponent,
    OnetoonecallComponent,
    GroupcallComponent,
    CallControlsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
