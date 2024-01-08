import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Trip } from '../trip';
import { TripService } from '../../services/trip.service';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-trip-form.component.html',
  styleUrl: './add-trip-form.component.css'
})
export class AddTripFormComponent implements OnInit {
  tripForm! : FormGroup;
  formBuilder = inject(FormBuilder);
  tripService = inject(TripService);
  userService = inject(UserService);
  fileService = inject(FileService);

  currentFile!: File;

  constructor() { }

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
      id: undefined,
      name: this.tripForm.value.name,
      destination: this.tripForm.value.destination,
      startDate: new Date(this.tripForm.value.startDate),
      endDate: new Date(this.tripForm.value.endDate),
      description: this.tripForm.value.description,
      price: this.tripForm.value.price,
      currency: this.tripForm.value.currency,
      maxGuests: this.tripForm.value.maxSlots,
      imgUrl: "",
      imgAlt: this.currentFile.name,
      reserved: false,
      available: this.tripForm.value.maxSlots,
      averageRating: 0,
      ratings: [],
    };

    // log type of tripForm.value.image
    console.log(this.tripForm.value.description);

    this.fileService.uploadImage(this.currentFile).subscribe((imgUrl) => {
      trip.imgUrl = imgUrl;
      this.tripService.addTrip(trip).subscribe(() => {
        // show success message
        alert("Trip added successfully!");
      
        // redirect to the offers page
        window.location.href = '/offers';
      });
    });
  }

    onFileSelected(event : any) {
      const file:File = event.target.files.item(0);

      if (file) {
        this.currentFile = file;
      }
  }

}


