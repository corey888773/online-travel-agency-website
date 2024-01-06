import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../trip';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.css'
})

export class TripComponent {
  @Input() trip!: Trip;
  @Input() borderColour: string = "black";

  @Output() removeTrip = new EventEmitter<Trip>();

  constructor(private apiService : ApiService) { }

  remove(): void {
    this.removeTrip.emit(this.trip);
  }

  adjustedPrice!: number;
  currenciesMap: { [key: string]: number } = {
    'PLN': 4.5,
    'EUR': 1,
    'USD': 1.2
  }
  shouldDisplayPlusButton(): boolean {
    return !this.trip.reserved && !this.isFull()
  }

  shouldDisplayMinusButton(): boolean {
    return this.trip.reserved && !this.isFull()
  }

  isAlmostFull(treshold: number = 3): boolean {
    return this.trip.maxGuests - this.trip.available >= this.trip.maxGuests - treshold
  }

  isFull(): boolean {
    return this.trip.maxGuests - this.trip.available === this.trip.maxGuests
  }  

  reserve(): void {
    this.trip.available--;
    this.trip.reserved = true;

    if (this.isFull()) {
      this.apiService.reserveTrip(this.trip, 1)
      alert("This trip is now full!")
    } else if (this.isAlmostFull()) {
      this.apiService.reserveTrip(this.trip, 1)
      alert("There are only a few slots left!")
    }
    else {
      this.apiService.reserveTrip(this.trip, 1)
      alert("You have successfully reserved a slot!")
    }
  }

  cancel(): void {
    this.trip.available++;
    this.trip.reserved = false;
    this.apiService.cancelReservation(this.trip)
    alert("You have successfully canceled your reservation!")
  }

  calculatePrice(event : Event): void {
    this.adjustedPrice = this.trip.price * this.currenciesMap[(event.target as HTMLInputElement).value];
  }

  rate(): void {
    const rating = parseInt(prompt("Please enter your rating (1-5):") || "0");
    if (rating >= 1 && rating <= 5) {
      this.trip.ratings.push(rating);
      this.trip.averageRating = this.trip.ratings.reduce((a, b) => a + b, 0) / this.trip.ratings.length;
      alert("Thank you for your rating!")
    } else {
      alert("Please enter a valid rating!")
    }
  }

  getImageUrl(): string {
    const baseUrl = 'http://localhost:8000';
    return `${baseUrl}/${this.trip.imgUrl}`;
  }
}


