import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../interfaces/trip';
import { TripFilterPipe } from '../trip-filter.pipe';
import { FormsModule } from '@angular/forms';

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
  @Output () filteredTrips = new EventEmitter<Trip[]>();

  constructor (
    private tripFilterPipe: TripFilterPipe
  ) {}

  filterByPriceMin! : number;
  filterByPriceMax! : number;
  filterByName!: string;
  filterByRatings!: Boolean[];
  ratingsFilter! : number[];
  filterByDestination!: string;
  filterByDatesMin!: Date;
  filterByDatesMax!: Date;
  searchTerm!: string;
  sortBy!: string;
  
  ngOnInit(): void {
    this.resetFilters();
  }

  applyFilters( ) : void {  
    this.filterByRatings.forEach((rating, index) => {
      if (rating) this.ratingsFilter.push(index + 1);
    });

    const filteredData = this.tripFilterPipe.transform(
      this.trips,
      this.searchTerm,
      this.filterByPriceMin,
      this.filterByPriceMax,
      this.filterByName,
      this.ratingsFilter,
      this.filterByDestination,
      this.filterByDatesMin,
      this.filterByDatesMax,
      this.sortBy
    );
    
    this.tripsLength = filteredData.length;
    this.filteredTrips.emit(filteredData);
  }

  resetFilters() : void {
    let minAndMaxPrice = this.getMinAndMaxPrice();
    let minAndMaxDates = this.getMinAndMaxDates();

    this.filterByPriceMin = minAndMaxPrice[0];
    this.filterByPriceMax = minAndMaxPrice[1];
    this.filterByName = '';
    this.filterByRatings = [];
    this.filterByDestination = '';
    this.filterByDatesMin = minAndMaxDates[0];
    this.filterByDatesMax = minAndMaxDates[1];
    this.searchTerm = '';
    this.sortBy = '';
    
    this.applyFilters();
  }

  searchFor(event: Event) {
      this.searchTerm = (event.target as HTMLInputElement).value;
      this.applyFilters();
    }

  getDestinationOptions() : string[] {
    return [...new Set(this.trips.map(trip => trip.destination))];
  }

  getMinAndMaxPrice() : number[] {
    let sortedTrips = this.trips.sort((a, b) => a.unitPrice - b.unitPrice);
    if (!sortedTrips.length) return [0, 0];
    
    const minPrice = sortedTrips[0].unitPrice;
    const maxPrice = sortedTrips[sortedTrips.length - 1].unitPrice;

    return [minPrice, maxPrice];
  }

  getMinAndMaxDates() : Date[] {
    let sortedTrips = this.trips.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (!sortedTrips.length) return [new Date(), new Date()];
    
    const minDate = sortedTrips[0].startDate;
    const maxDate = sortedTrips[sortedTrips.length - 1].endDate;

    return [minDate, maxDate];
  }
}
