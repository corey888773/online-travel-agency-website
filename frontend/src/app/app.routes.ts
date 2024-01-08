import { Routes } from '@angular/router';
import { OffersPageComponent } from './trips/offers-page/offers-page.component';
import { HomeComponent } from './home/home.component';
import { AddTripFormComponent } from './trips/add-trip-form/add-trip-form.component';
import { UpdateTripFormComponent } from './trips/update-trip-form/update-trip-form.component';
import { LoginComponent } from './users/login/login.component';
import { RegisterComponent } from './users/register/register.component';
import { TripPageComponent } from './trips/trip-page/trip-page.component';
import { MyTripsPageComponent } from './trips/my-trips-page/my-trips-page.component';
import { ShoppingCartPageComponent } from './orders/shopping-cart-page/shopping-cart-page.component';
import { adminGuard } from './services/guards/admin.guard';
import { authGuard } from './services/guards/auth.guard';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'offers', component: OffersPageComponent, canActivate: [authGuard]},
    {path: 'trips/add', component: AddTripFormComponent, canActivate: [adminGuard]},
    {path: 'trips/update/:id', component: UpdateTripFormComponent, canActivate: [adminGuard]},
    {path: 'trips/:id', component: TripPageComponent, canActivate: [authGuard]},
    {path: 'reservations', component: MyTripsPageComponent, canActivate: [authGuard]},
    {path: 'cart', component: ShoppingCartPageComponent, canActivate: [authGuard]},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent },
    
];
