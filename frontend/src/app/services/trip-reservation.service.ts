import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TripReservation } from '../trips/trip-reservation';


@Injectable({
  providedIn: 'root'
})
export class TripReservationService {
  baseUrl = 'http://localhost:8000/tripReservations/';

  constructor(private httpClient : HttpClient) { }

  public reserveTrip(username : string, tripId: string, quantity: number) : Observable<any> {
    const tripReservation = {
      username,
      tripId,
      quantity
    };
    return this.httpClient.post(this.baseUrl, tripReservation);
  }

  public getMyReservations() : Observable<TripReservation[]> {
    const url = this.baseUrl + 'me';

    return this.httpClient.get(url).pipe(
      map((response: any) => {
        const reservations = response.tripReservations.map((reservation: any) => {
          const reservationObj: TripReservation = {
            id: reservation.id,
            tripID: reservation.trip.id,
            tripName: reservation.trip.name,
            tripDestination: reservation.trip.destination,
            tripStartDate: new Date(reservation.trip.startDate),
            tripEndDate: new Date(reservation.trip.endDate),
            quantity: reservation.quantity,
            reservationStatus: reservation.reservationStatus.status,
            reservationStatusChangedAt: new Date(reservation.reservationStatus.changedAt),
            rating: reservation.rating,
          };

          return reservationObj;
        });
        return reservations;
      }));
  }

  public rateTripReservation(tripReservation : TripReservation, username: string) : Observable<any> {
    const url = this.baseUrl + 'rate';
    const body = {
      'reservationID': tripReservation.id,
      'username': username,
      'rating': tripReservation.rating
    };
    return this.httpClient.patch(url, body);
  }
}
