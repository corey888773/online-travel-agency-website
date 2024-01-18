import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripComponent } from '../trip/trip.component';
import { Trip } from '../trip';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OffersPageFilterComponent } from '../offers-page-filter/offers-page-filter.component';
import { TripService } from '../../services/trip.service';
import { GetTripsParams } from '../get-trips-params';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule, 
    TripComponent, 
    FormsModule,
    OffersPageFilterComponent
  ],
  templateUrl: './offers-page.component.html',
  styleUrl: './offers-page.component.css',
})
export class OffersPageComponent implements OnInit{
  trips: Trip[] = [];

  tripService = inject(TripService);

  ngOnInit(): void {
    const params : GetTripsParams = {
      minPrice: undefined,
      maxPrice: undefined,
      ratings: undefined,
      destination: undefined,
      minDate: undefined,
      maxDate: undefined,
      searchTerm: undefined,
      sortBy: undefined,
    };
    this.tripService.getTrips(params).subscribe((data: any[]) => {
      this.trips = data;
    });
  } 

  calculateTripColour(trip : Trip): string {
    // gradient from green to red based on index price
    // 0 - green, 1 - red
    let tripsCopy = this.trips.slice();
    const sortedByPrice = tripsCopy.sort((a, b) => a.price - b.price);
    const tripIndex = sortedByPrice.findIndex(t => t.name === trip.name);

    const relativeIndex = tripIndex/(this.trips.length - 1);

    const red = Math.round(255 * relativeIndex);
    const green = Math.round(255 * (1 - relativeIndex));
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }

  countReservedTrips() : number {
    return this.trips.filter(trip => trip.reserved).length;
  }

  removeTrip(event: Trip): void {
    // this.apiService.removeTrip(event).subscribe(() => {
    //   this.trips = this.trips.filter(trip => trip.name !== event.name);
    // });
  }

  filterTrips(params : GetTripsParams) : void {
    this.tripService.getTrips(params).subscribe((data: any[]) => {
      this.trips = data;
    });
  }
}

