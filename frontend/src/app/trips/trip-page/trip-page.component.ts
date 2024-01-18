import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../trip';
import { TripService } from '../../services/trip.service';
import { FileService } from '../../services/file.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TripReservationService } from '../../services/trip-reservation.service';
import { UserService } from '../../services/user.service';
import { ShoppingCartService } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-trip-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-page.component.html',
  styleUrl: './trip-page.component.css'
})
export class TripPageComponent implements OnInit {
  tripId!: string;
  trip!: Trip;
  tripService : TripService = inject(TripService);
  fileService : FileService = inject(FileService);
  userService : UserService = inject(UserService);
  tripReservationService : TripReservationService = inject(TripReservationService);
  shoppingCartService : ShoppingCartService = inject(ShoppingCartService);

  tripIsLoaded: boolean = false;

  formBuilder = inject(FormBuilder);
  reservationForm! : FormGroup;

  ngOnInit(): void {
    this.tripId = window.location.pathname.split('/').pop()!;

    this.reservationForm = this.formBuilder.group({
      quantity: ["1", Validators.required],
    });


    this.tripService.getTrip(this.tripId).subscribe((trip: Trip) => {
      this.trip = trip;
      this.tripIsLoaded = true;
    });
  }

  getTripImage(): string {
    return this.fileService.getImagePath(this.trip.imgUrl);
  }

  reserveTrip(): void {
    let username = this.userService.currentUserSignal()?.username;

    if (!username) {
      alert('You have to be logged in to reserve a trip!');
      return;
    }

    let quantity = this.reservationForm.value.quantity;
    let success = this.shoppingCartService.addTripToCart(this.trip, quantity);
    if (success) {
      alert('Trip added to cart!');
    } else {
      alert('Could not add trip to cart!');
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
