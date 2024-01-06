import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Trip } from '../trip';

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
      price: ['', Validators.required],
      currency: ['', Validators.required],
      maxSlots: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onSubmit() {
  //  create trip object from form fields
    let trip : Trip = {
      id: '',
      name: this.tripForm.value.name,
      destination: this.tripForm.value.destination,
      startDate: this.tripForm.value.startDate,
      endDate: this.tripForm.value.endDate,
      description: this.tripForm.value.description,
      price: this.tripForm.value.price,
      currency: this.tripForm.value.currency,
      maxGuests: this.tripForm.value.maxSlots,
      imgUrl: this.tripForm.value.image.name,
      imgAlt: this.tripForm.value.image.name,
      reserved: false,
      available: 0,
      averageRating: 0,
      ratings: [],
    };

    this.apiService.addTrip(trip).subscribe(() => {
      // redirect to the offers page
      window.location.href = '/offers';
    });
  }

}
