import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  baseUrl = 'http://localhost:8000/trips';
  constructor() { }
}
