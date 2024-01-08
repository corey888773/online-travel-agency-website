import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripReservationComponent } from './trip-reservation.component';

describe('TripReservationComponent', () => {
  let component: TripReservationComponent;
  let fixture: ComponentFixture<TripReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripReservationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
