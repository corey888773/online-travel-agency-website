import { Component, inject, OnInit } from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { CommonModule } from '@angular/common';
import { ShoppingCart } from '../shopping-cart';
import { ShoppingCartItem } from '../shopping-cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-cart-page.component.html',
  styleUrl: './shopping-cart-page.component.css'
})
export class ShoppingCartPageComponent implements OnInit {
  shoppingCartService = inject(ShoppingCartService);
  shoppingCart! : ShoppingCart;
  router = inject(Router);

  ngOnInit(): void {
    this.shoppingCart = this.shoppingCartService.shoppingCartSignal();
  }

  removeItem(item : ShoppingCartItem){
    this.shoppingCartService.removeItem(item);
  }

  goToTripPage(item : ShoppingCartItem): void {
    // window.location.href = `/trips/${item.tripID}`;
    this.router.navigateByUrl(`/trips/${item.tripID}`);
  }

  checkout(): void {
    alert('Thank you for your purchase! Redirecting to payment service...');
    this.shoppingCartService.clearCart();
  }

  updateQuantity(item : ShoppingCartItem, event : Event): void {
    let quantity = (event.target as HTMLInputElement).value;

    this.shoppingCartService.updateQuantity(item, parseInt(quantity));
    console.log(this.shoppingCart);
  }

  goToOffersPage(){
    this.router.navigateByUrl('/offers');
  }
}
