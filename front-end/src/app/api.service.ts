import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip } from './trip';
import { Observable, map, tap } from 'rxjs';
import * as fs from 'fs';
import { Basket } from './basket';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  basket: Basket =  {
    reservations: [],
    totalPrice: 0,
    currency: 'USD',
  }

  public getBasket(): Basket {
    return this.basket;
  }

  public reserveTrip(trip: Trip, quantity: number) {
    this.basket.reservations.push({
      tripUuid: trip.uuid,
      quantity: quantity
    });
    this.basket.totalPrice += trip.unitPrice * quantity;
  }

  public cancelReservation(trip: Trip) {
    const reservation = this.basket.reservations.find(r => r.tripUuid === trip.uuid);
    if (reservation) {
      this.basket.reservations = this.basket.reservations.filter(r => r.tripUuid !== trip.uuid);
      this.basket.totalPrice -= trip.unitPrice * reservation.quantity;
    }
  }

  constructor(private httpClient : HttpClient) {
  }

  public getTrips(): Observable<Trip[]> {
    // load trips from assets/trips.json
    return this.httpClient.get<Trip[]>('assets/trips.json');
  }

  public removeTrip(trip: Trip) {
    return this.getTrips().pipe(
      // filter out the trip to be removed
      map((trips: Trip[]) => trips.filter(t => t.name !== trip.name)),
      // save the new array of trips
      tap((trips: Trip[]) => this.saveTrips(trips))
    );
  }

  public addTrip(trip: Trip) {
    // save the trip image to assets/trips_images

    return this.getTrips().pipe(
      // add the new trip to the array
      map((trips: Trip[]) => trips.concat(trip)),
      // save the new array of trips
      tap((trips: Trip[]) => this.saveTrips(trips))
    );
  }

  public saveTrips(trips: Trip[]) {
    // save the trips to local storage
    localStorage.setItem('trips', JSON.stringify(trips));
  }
}
