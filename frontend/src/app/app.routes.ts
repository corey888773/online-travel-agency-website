import { Routes } from '@angular/router';
import { OffersComponent } from './trips/trips-page/offers.component';
import { HomeComponent } from './home/home.component';
import { TripFormComponent } from './trips/trip-form/trip-form.component';
import { LoginComponent } from './users/login/login.component';
import { RegisterComponent } from './users/register/register.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'offers', component: OffersComponent},
    {path: 'offers/add', component: TripFormComponent },
    {path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
];
