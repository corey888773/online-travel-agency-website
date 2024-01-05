import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripComponent } from '../trip/trip.component';
import { TripFormComponent } from '../trip-form/trip-form.component';
import { Trip } from '../interfaces/trip';
import { OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';
import { OffersFilterComponent } from '../offers-filter/offers-filter.component';
import { Basket } from '../interfaces/basket';
import { BasketWidgetComponent } from '../basket-widget/basket-widget.component';

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

  constructor(
    private apiService: ApiService,    
    ) {
      this.basket = apiService.getBasket();
    }

  ngOnInit(): void {
    this.apiService.getTrips().subscribe((data: any[]) => {
      this.trips = data.sort((a, b) => a.unitPrice - b.unitPrice);
      this.filteredTrips = this.trips;
    });
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

  filterTrips($event : Trip[]) {
    this.filteredTrips = $event;
  }
}

