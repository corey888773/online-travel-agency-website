import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripComponent } from '../trip/trip.component';
import { TripFormComponent } from '../trip-form/trip-form.component';
import { Trip } from '../trip';
import { OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { OffersFilterComponent } from '../trips-page-filter/offers-filter.component';
import { Basket } from '../../interfaces/basket';
import { BasketWidgetComponent } from '../basket-widget/basket-widget.component';
import { TripService } from '../../services/trip.service';
import { GetTripsParams } from '../get-trips-params';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule, 
    TripComponent, 
    TripFormComponent, 
    FormsModule,
    OffersFilterComponent,
    BasketWidgetComponent
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent implements OnInit{
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  basket!: Basket;

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
      console.log(data);

      this.filteredTrips = data;
    });
  } 

  calculateTripColour(trip : Trip): string {
    // gradient from green to red based on index price
    // 0 - green, 1 - red
    const minPrice = this.trips[0].price;
    const maxPrice = this.trips[this.trips.length - 1].price;

    const index = (trip.price - minPrice) / (maxPrice - minPrice);

    const red = Math.round(255 * index);
    const green = Math.round(255 * (1 - index));
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
      console.log(data);

      this.trips = data
      this.filteredTrips = data;
    });
  }
}

