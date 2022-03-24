import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { OnetoonecallComponent } from './onetoonecall/onetoonecall.component';
import { GroupcallComponent } from './groupcall/groupcall.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'onetoone',
    component: OnetoonecallComponent,
  },
  {
    path: 'group',
    component: GroupcallComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
