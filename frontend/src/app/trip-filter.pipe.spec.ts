import { Pipe, PipeTransform } from '@angular/core';
import { Trip } from './interfaces/trip';

@Pipe({
  name: 'tripFilter'
})
export class TripFilterPipe implements PipeTransform {
  transform(
    trips: Trip[],
    searchTerm: string,
    filterByPrice: number,
    filterByName: string,
    filterByRatings: number,
    filterByDestination: string,
    filterByDates: Date[],
    sortBy: string
  ): Trip[] {
    let filteredTrips = trips;

    // Filter by search term
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => {
        return (
          trip.name.toLowerCase().includes(searchTerm) ||
          trip.destination.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by price
    if (filterByPrice) {
      filteredTrips = filteredTrips.filter(trip => {
        return trip.unitPrice <= filterByPrice;
      });
    }

    // Filter by name
    if (filterByName) {
      filterByName = filterByName.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => {
        return trip.name.toLowerCase().includes(filterByName);
      });
    }

    // Filter by ratings
    if (filterByRatings) {
      filteredTrips = filteredTrips.filter(trip => {
        return trip.averageRating >= filterByRatings;
      });
    }

    // Filter by destination
    if (filterByDestination) {
      filterByDestination = filterByDestination.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => {
        return trip.destination.toLowerCase().includes(filterByDestination);
      });
    }

    // Filter by dates
    if (filterByDates && filterByDates.length === 2) {
      const startDate = filterByDates[0];
      const endDate = filterByDates[1];
      filteredTrips = filteredTrips.filter(trip => {
        return trip.startDate >= startDate && trip.endDate <= endDate;
      });
    }

    // Sort by field
    if (sortBy) {
      filteredTrips = filteredTrips.sort((a, b) => {
        if (sortBy === 'price') {
          return a.unitPrice - b.unitPrice;
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'ratings') {
          return b.averageRating - a.averageRating;
        } else {
          return 0;
        }
      });
    }

    return filteredTrips;
  }
}