import { TestBed } from '@angular/core/testing';

import { TripReservationService } from './trip-reservation.service';

describe('TripReservationService', () => {
  let service: TripReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
