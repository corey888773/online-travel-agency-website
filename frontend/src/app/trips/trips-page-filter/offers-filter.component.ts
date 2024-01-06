import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../trip';
import { TripFilterPipe } from '../../trip-filter.pipe';
import { FormsModule } from '@angular/forms';
import { GetTripsParams } from '../get-trips-params';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-offers-filter',
  standalone: true,
  imports: [
    CommonModule,
    TripFilterPipe,
    FormsModule
  ],
  providers: [TripFilterPipe],
  templateUrl: './offers-filter.component.html',
  styleUrl: './offers-filter.component.css'
})
export class OffersFilterComponent implements OnInit {
  @Input () trips!: Trip[];
  tripsLength!: number;
  @Output () filterParams = new EventEmitter<GetTripsParams>();
  tripService = inject(TripService);

  constructor (
    private tripFilterPipe: TripFilterPipe
  ) {}

  filterByPriceMin : number | undefined;
  filterByPriceMax : number | undefined;
  filterByName: string | undefined;
  filterByRatings: Boolean[] = [];
  ratingsFilter: number[] = [];
  filterByDestination: string | undefined;
  filterByDatesMin: Date | undefined;
  filterByDatesMax: Date | undefined;
  searchTerm: string | undefined;
  sortBy: string | undefined;
  
  ngOnInit(): void {
    this.resetFilters();
  }

  applyFilters( ) : void {  
    if (!this.filterByRatings) this.filterByRatings = [];
    for (let i = 0; i < this.filterByRatings.length; i++) {
      if (this.filterByRatings[i]) {
        this.ratingsFilter.push(i);
      }
    }

    const params : GetTripsParams = {
      minPrice: this.filterByPriceMin,
      maxPrice: this.filterByPriceMax,
      ratings: this.ratingsFilter,
      destination: this.filterByDestination,
      minDate: this.filterByDatesMin,
      maxDate: this.filterByDatesMax,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
    }

    this.filterParams.emit(params);
  }

  resetFilters() : void {

    this.filterByPriceMin = undefined;
    this.filterByPriceMax = undefined;
    this.filterByName = undefined;
    this.filterByRatings = [];
    this.filterByDestination = undefined;
    this.filterByDatesMin = undefined;
    this.filterByDatesMax = undefined;
    this.searchTerm = undefined;
    this.sortBy = undefined;
    
    this.applyFilters();
  }

  searchFor(event: Event) {
      this.searchTerm = (event.target as HTMLInputElement).value;
      this.applyFilters();
    }

  getDestinationOptions() : string[] {
    return [...new Set(this.trips.map(trip => trip.destination))];
  }
}
