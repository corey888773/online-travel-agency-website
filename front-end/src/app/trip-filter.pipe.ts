import { Pipe, PipeTransform } from '@angular/core';
import { Trip } from './trip';

@Pipe({
  name: 'tripFilter',
  standalone: true
})
export class TripFilterPipe implements PipeTransform {
  transform(
    trips: Trip[],
    searchTerm: string,
    filterByPriceMin: number,
    filterByPriceMax: number,
    filterByName: string,
    filterByRatings: number[],
    filterByDestination: string,
    filterByDatesMin: Date,
    filterByDatesMax: Date,
    sortBy: string
  ): Trip[] {
    let filteredTrips = trips;

    if (searchTerm){
      searchTerm = searchTerm.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => trip.destination.toLowerCase().includes(searchTerm));
    }

    if (filterByPriceMin || filterByPriceMax){
      if (!filterByPriceMin) filterByPriceMin = 0;
      if (!filterByPriceMax) filterByPriceMax = Infinity;

      filteredTrips = filteredTrips.filter(trip => trip.unitPrice >= filterByPriceMin && trip.unitPrice <= filterByPriceMax);
    }

    // if (filterByRatings){
    //   // go through all ratings and check if trip floor rating is in the filterByRatings array

    //   filteredTrips = filteredTrips.filter(trip => filterByRatings.includes(Math.floor(trip.averageRating)));
    // }

    if (filterByDestination){
      filteredTrips = filteredTrips.filter(trip => trip.destination === filterByDestination);
    }

    if (filterByDatesMin || filterByDatesMax){
      if (!filterByDatesMin) filterByDatesMin = new Date();
      if (!filterByDatesMax) filterByDatesMax = new Date(8640000000000000);
      
      filteredTrips = filteredTrips.filter(trip => {
        const tripStartDate = new Date(trip.startDate);
        const tripEndDate = new Date(trip.endDate);
        const filterByDatesMinCasted = new Date(filterByDatesMin);
        const filterByDatesMaxCasted = new Date(filterByDatesMax);

        return tripStartDate >= filterByDatesMinCasted && tripEndDate <= filterByDatesMaxCasted;
      });
    }

    switch (sortBy) {
      case 'price':
        filteredTrips = filteredTrips.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case 'rating':
        filteredTrips = filteredTrips.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'name':
        filteredTrips = filteredTrips.sort((a, b) => a.destination.localeCompare(b.destination));
        break;
      default:
        break;
    }

    return filteredTrips;
  }
}
