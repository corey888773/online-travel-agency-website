import { Pipe, PipeTransform } from '@angular/core';
import { Trip } from './trip';

@Pipe({
  name: 'tripSearch',
  standalone: true
})
export class TripSearchPipe implements PipeTransform {

  transform(trips: Trip[], searchTerm: string): Trip[] {
    if (!searchTerm) {
      return trips; // Return all trips if search term is empty
    }
  
    searchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
  
    return trips.filter(trip => {
      // Implement your search logic here
      // Return true if the trip matches the search term, otherwise return false
      return trip.destination.toLowerCase().includes(searchTerm);
    });
  }

}
