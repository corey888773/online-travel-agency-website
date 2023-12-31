import { Routes } from '@angular/router';
import { OffersComponent } from './offers/offers.component';
import { HomeComponent } from './home/home.component';
import { TripFormComponent } from './trip-form/trip-form.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'offers', component: OffersComponent},
    {path: 'offers/add', component: TripFormComponent }
];
