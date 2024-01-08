import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { TripService } from '../../services/trip.service';
import { UserService } from '../../services/user.service';
import { Rating, Trip } from '../trip';
import { CommonModule,formatDate } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-trip-form.component.html',
  styleUrl: './update-trip-form.component.css'
})
export class UpdateTripFormComponent {
  tripForm! : FormGroup;
  formBuilder = inject(FormBuilder);
  tripService = inject(TripService);
  userService = inject(UserService);
  fileService = inject(FileService);
  
  attachedFile!: File;
  
  currentTrip!: Trip;
  
  willUpdateImageFlag: boolean = false;

  constructor() { }

  ngOnInit() {
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

    let tripId = window.location.pathname.split('/').pop()!;

    this.tripService.getTrip(tripId).subscribe((trip: Trip) => {
      this.currentTrip = trip;

      this.tripForm.patchValue({
        name: trip.name, 
        destination: trip.destination, 
        startDate: formatDate(trip.startDate, 'yyyy-MM-dd', 'en'), 
        endDate: formatDate(trip.startDate, 'yyyy-MM-dd', 'en'), 
        description: trip.description, 
        price: trip.price, 
        currency: trip.currency, 
        maxSlots: trip.maxGuests, 
      });
    });
  }

  onSubmit() {
    let trip : Trip = {
      id: this.currentTrip.id,
      name: this.tripForm.value.name,
      destination: this.tripForm.value.destination,
      startDate: new Date(this.tripForm.value.startDate),
      endDate: new Date(this.tripForm.value.endDate),
      description: this.tripForm.value.description,
      price: this.tripForm.value.price,
      currency: this.tripForm.value.currency,
      maxGuests: this.tripForm.value.maxSlots,
      imgUrl: this.currentTrip.imgUrl,
      imgAlt: this.currentTrip.imgAlt,
      reserved: false,
      available: this.tripForm.value.maxSlots,
      averageRating: this.currentTrip.averageRating,
      ratings: this.currentTrip.ratings,
    };

    if (!this.willUpdateImageFlag) {
      this.updateTrip(trip);
      return;
    }
    
    this.fileService.uploadImage(this.attachedFile).subscribe((imgUrl) => {
      trip.imgUrl = imgUrl;
      trip.imgAlt = this.attachedFile.name;
      this.updateTrip(trip);
    });
  }

    onFileSelected(event : any) {
      const file:File = event.target.files.item(0);

      if (file) {
        this.attachedFile = file;
      }
  }

  showImageField() {
    console.log(this.willUpdateImageFlag);
    this.willUpdateImageFlag = !this.willUpdateImageFlag;
  }

  updateTrip(trip : Trip) {
    this.tripService.updateTrip(trip).subscribe(() => {
      // show success message
      alert("Trip updated successfully!");
    
      // redirect to the offers page
      window.location.href = '/offers';
    });
  }

}
