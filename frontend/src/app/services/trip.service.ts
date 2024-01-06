import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../trips/trip';
import { map } from 'rxjs/operators';
import { GetTripsParams } from '../trips/get-trips-params';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  baseUrl = 'http://localhost:8000/trips/';
  constructor(private httpClient : HttpClient ) {}

  public getTrips(params : GetTripsParams) : Observable<Trip[]> 
  {
    const queryParams = new URLSearchParams();
    if (params.minPrice) {
      queryParams.set('MinPrice', params.minPrice.toString());
    }
    if (params.maxPrice) {
      queryParams.set('MaxPrice', params.maxPrice.toString());
    }
    if (params.ratings) {
      queryParams.set('Ratings', params.ratings.toString());
    }
    if (params.destination) {
      queryParams.set('Destination', params.destination.toString());
    }
    if (params.minDate) {
      const minDate = new Date(params.minDate);
      queryParams.set('MinDate', minDate.toISOString());
    }
    if (params.maxDate) {
      const maxDate = new Date(params.maxDate);
      queryParams.set('MaxDate', maxDate.toISOString());
    }
    if (params.searchTerm) {
      queryParams.set('SearchTerm', params.searchTerm.toString());
    }
    if (params.sortBy) {
      queryParams.set('SortBy', params.sortBy.toString());
    }

    const url = this.baseUrl + '?' + queryParams.toString();

    return this.httpClient.get(url).pipe(
      map((response: any) => {
        const trips = response.trips.map((trip: any) => {
          const tripObj: Trip = {
            id: trip.id,
            name: trip.name,
            description: trip.description,
            price: trip.price,
            imgUrl: trip.imgUrl,
            imgAlt: trip.imgAlt,
            maxGuests: trip.maxGuests,
            available: trip.available,
            startDate: new Date(trip.startDate),
            endDate: new Date(trip.endDate),
            currency: trip.currency,
            destination: trip.destination,
            averageRating: trip.averageRating ?? 0,
            ratings: trip.ratings ?? [],
            reserved: trip.reserved ?? false,
          };
          return tripObj;
          });

        return trips;
      }));
  }
}
