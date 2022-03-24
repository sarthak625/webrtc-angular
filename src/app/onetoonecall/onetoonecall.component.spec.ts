import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnetoonecallComponent } from './onetoonecall.component';

describe('OnetoonecallComponent', () => {
  let component: OnetoonecallComponent;
  let fixture: ComponentFixture<OnetoonecallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnetoonecallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnetoonecallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
