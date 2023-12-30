import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../trip';

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
    return this.trip.reservedSlots >= this.trip.maxSlots - treshold
  }

  isFull(): boolean {
    return this.trip.reservedSlots === this.trip.maxSlots
  }  

  reserve(): void {
    this.trip.reservedSlots++;
    this.trip.reserved = true;

    if (this.isFull()) {
      alert("This trip is now full!")
    } else if (this.isAlmostFull()) {
      alert("There are only a few slots left!")
    }
    else {
      alert("You have successfully reserved a slot!")
    }
  }

  cancel(): void {
    this.trip.reservedSlots--;
    this.trip.reserved = false;
    alert("You have successfully canceled your reservation!")
  }



  calculatePrice(event : Event): void {
    this.adjustedPrice = this.trip.unitPrice * this.currenciesMap[(event.target as HTMLInputElement).value];
  }
}


