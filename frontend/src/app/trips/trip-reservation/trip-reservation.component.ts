import { Component, Input, inject, OnInit } from '@angular/core';
import { TripReservation } from '../trip-reservation';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripReservationService } from '../../services/trip-reservation.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-trip-reservation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-reservation.component.html',
  styleUrl: './trip-reservation.component.css'
})
export class TripReservationComponent implements OnInit{
  COMPLETION_STATUS = {
    COMPLETED: 'Completed',
    IN_PROGRESS: 'In progress',
    UPCOMING: 'Upcoming'
  };

  @Input() tripReservation!: TripReservation;
  completionStatus! : string;
  router = inject(Router);
  tripReservationService = inject(TripReservationService);
  userService = inject(UserService);

  constructor() { }

  ngOnInit(): void {
    
  }

  goToTripPage(): void {
    this.router.navigateByUrl(`/trips/${this.tripReservation.tripID}`);
  }

  determineCompletionStatus(): string {
    if (this.tripReservation.tripEndDate < new Date()) {
      return this.COMPLETION_STATUS.COMPLETED;
    }

    if (this.tripReservation.tripStartDate < new Date()) {
      return this.COMPLETION_STATUS.IN_PROGRESS;
    }

    return this.COMPLETION_STATUS.UPCOMING;
  }

  rate(event : Event): void {
    let rate = (event.target as HTMLInputElement).value;
    this.tripReservation.rating = parseInt(rate);
    this.tripReservationService
    .rateTripReservation(this.tripReservation, this.userService.currentUserSignal()!.username)
    .subscribe(
      (data: any) => {
        console.log(data);
        alert('Thank you for rating!');
      },
      (error: any) => {
        console.log(error);
      }
    );
    
  }

  removeRate(): void {
    this.tripReservation.rating = 0;
  }
}
