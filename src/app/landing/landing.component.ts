import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  onOneToOneCall() {
    console.log('One to one call');
    this.router.navigate(['onetoone']);
  }

  onGroupCall() {
    console.log('Group call');
    this.router.navigate(['group']);
  }
}
