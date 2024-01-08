import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../trips/trip';
import { map } from 'rxjs/operators';
import { GetTripsParams } from '../trips/get-trips-params';
import { formatDate } from '@angular/common';

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
          const tripObj: any = {
            id: trip.id,
            name: trip.name,
            description: trip.description,
            destination: trip.destination,
            price: trip.price,
            imgUrl: trip.imgUrl,
            imgAlt: trip.imgAlt,
            maxGuests: trip.maxGuests,
            available: trip.available,
            startDate: new Date(trip.startDate),
            endDate: new Date(trip.endDate),
            currency: trip.currency,
          };
          return tripObj;
          });

        return trips;
      }));
  }

  public addTrip(trip : Trip) : Observable<string> {
    return this.httpClient.post<string>(this.baseUrl, trip);
  }

  public updateTrip(trip : Trip) : Observable<Trip> {
    return this.httpClient.patch<Trip>(this.baseUrl + trip.id, trip);
  }

  public getTrip(id : string) : Observable<Trip> {
    return this.httpClient.get<Trip>(this.baseUrl + id).pipe(
      map((response : any) => {
        
        const trip : Trip = {
          id: response.trip.id,
          name: response.trip.name,
          description: response.trip.description,
          destination: response.trip.destination,
          price: response.trip.price,
          imgUrl: response.trip.imgUrl,
          imgAlt: response.trip.imgAlt,
          maxGuests: response.trip.maxGuests,
          available: response.trip.available,
          startDate: this.formatDate(response.trip.startDate),
          endDate: this.formatDate(response.trip.endDate),
          currency: response.trip.currency,
          reserved: response.trip.reserved,
          averageRating: response.trip.averageRating,
          ratings: response.trip.ratings,
        };

        console.log(trip);
        return trip;
      }));
  }

  formatDate(dateString: string): Date {
    const formattedDate = formatDate(dateString, 'yyyy-MM-dd', 'en-US');
    return new Date(formattedDate);
  }
}
