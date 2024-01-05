import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Trip } from '../interfaces/trip';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trip-form.component.html',
  styleUrl: './trip-form.component.css'
})
export class TripFormComponent implements OnInit {
  tripForm! : FormGroup;

  constructor(
    private formBuilder: FormBuilder,
     private apiService: ApiService) { }

  ngOnInit() {
    // Inicjalizacja formularza i ustawienie walidatorów
    this.tripForm = this.formBuilder.group({
      name: ['', Validators.required],
      destination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      unitPrice: ['', Validators.required],
      currency: ['', Validators.required],
      maxSlots: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onSubmit() {
  //  create trip object from form fields
    let trip : Trip = {
      uuid: '',
      name: this.tripForm.value.name,
      destination: this.tripForm.value.destination,
      startDate: this.tripForm.value.startDate,
      endDate: this.tripForm.value.endDate,
      description: this.tripForm.value.description,
      unitPrice: this.tripForm.value.unitPrice,
      currency: this.tripForm.value.currency,
      maxSlots: this.tripForm.value.maxSlots,
      image: this.tripForm.value.image.name,
      reserved: false,
      reservedSlots: 0,
      averageRating: 0,
      ratings: [],
    };

    this.apiService.addTrip(trip).subscribe(() => {
      // redirect to the offers page
      window.location.href = '/offers';
    });
  }

}
