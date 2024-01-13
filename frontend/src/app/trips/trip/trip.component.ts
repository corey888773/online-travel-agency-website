import { Component, EventEmitter, Input, Output, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../trip';
import { Router} from '@angular/router';
import { FileService } from '../../services/file.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.css'
})

export class TripComponent implements OnInit {
  @Input() trip!: Trip;
  @Input() borderColour: string = "black";
  @Output() removeTrip = new EventEmitter<Trip>();

  router = inject(Router);
  fileService = inject(FileService);
  userService = inject(UserService);

  ngOnInit(): void {
    this.adjustedPrice = this.trip.price.toFixed(2);
  }

  remove(): void {
    this.removeTrip.emit(this.trip);
  }

  adjustedPrice!: string;
  currency: string = "USD";
  currenciesMap: { [key: string]: number } = {
    'PLN': 4,
    'EUR': 0.91,
    'USD': 1
  }

  shouldDisplayPlusButton(): boolean {
    return !this.trip.reserved && !this.isFull()
  }

  shouldDisplayMinusButton(): boolean {
    return this.trip.reserved && !this.isFull()
  }

  isAlmostFull(treshold: number = 3): boolean {
    return this.trip.available <= treshold;
  }

  isFull(): boolean {
    return this.trip.maxGuests - this.trip.available === this.trip.maxGuests
  }  

  cancel(): void {
    this.trip.available++;
    this.trip.reserved = false;
    alert("You have successfully canceled your reservation!")
  }

  calculatePrice(event : Event): void {
    this.currency = (<HTMLInputElement>event.target).value;
    const currencyValue = this.currenciesMap[this.currency];
    if (currencyValue !== undefined) {
      this.adjustedPrice = (this.trip.price * currencyValue).toFixed(2);
    }
  }

  getImageUrl(): string {
    return this.fileService.getImagePath(this.trip.imgUrl);
  }

  goToTripPage(): void {
    this.router.navigateByUrl(`/trips/${this.trip.id}`);
  }

  goToUpdateTripPage(): void {
    this.router.navigateByUrl(`/trips/update/${this.trip.id}`);
  }

  isAdmin() : boolean {
    return this.userService.currentUserSignal()?.role === 'admin';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}



