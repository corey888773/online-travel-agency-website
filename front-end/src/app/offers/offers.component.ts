import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripComponent } from '../trip/trip.component';
import { Trip } from '../trip';
import { OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TripSearchPipe } from '../trip-search.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, TripComponent, TripSearchPipe, FormsModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent implements OnInit{
  trips: Trip[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTrips().subscribe((data: any[]) => {
      this.trips = data.sort((a, b) => a.unitPrice - b.unitPrice);
    });
  } 

  searchTerm: string = '';
  searchFor(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  calculateTripColour(trip : Trip): string {
    // gradient from green to red based on index price
    // 0 - green, 1 - red
    const minPrice = this.trips[0].unitPrice;
    const maxPrice = this.trips[this.trips.length - 1].unitPrice;

    const index = (trip.unitPrice - minPrice) / (maxPrice - minPrice);

    const red = Math.round(255 * index);
    const green = Math.round(255 * (1 - index));
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }

  countReservedTrips() : number {
    return this.trips.filter(trip => trip.reserved).length;
  }

  removeTrip(event: Trip): void {
    this.apiService.removeTrip(event).subscribe(() => {
      this.trips = this.trips.filter(trip => trip.name !== event.name);
    });
  }
}

