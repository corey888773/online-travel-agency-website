import { Component, OnInit, inject } from '@angular/core';
import { TripReservationService } from '../../services/trip-reservation.service';
import { CommonModule } from '@angular/common';
import { TripReservation } from '../trip-reservation';
import { TripReservationComponent } from '../trip-reservation/trip-reservation.component';

@Component({
  selector: 'app-my-trips-page',
  standalone: true,
  imports: [CommonModule, TripReservationComponent],
  templateUrl: './my-trips-page.component.html',
  styleUrl: './my-trips-page.component.css'
})
export class MyTripsPageComponent implements OnInit{
  tripReservationService : TripReservationService = inject(TripReservationService);
  myReservations: TripReservation[] = [];

  ngOnInit(): void {
    this.tripReservationService.getMyReservations().subscribe((data: any) => {
      this.myReservations = data
      console.log(data);
    });
  }
}
