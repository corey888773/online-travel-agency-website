import { Injectable, signal} from '@angular/core';
import { ShoppingCart } from '../orders/shopping-cart';
import { Trip } from '../trips/trip';
import { ShoppingCartItem } from '../orders/shopping-cart';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService{
  shoppingCartSignal = signal<ShoppingCart> ({
    items: [],
    totalPrice: 0,
    currency: 'USD',
  });

  constructor() { 
    this.loadCartFromSessionStorage();
  }

  addTripToCart(trip: Trip, quantity: number) : boolean{
    if (quantity <= 0 || quantity > trip.available) {
      return false;
    }

    let existingItem = this.shoppingCartSignal().items.find(item => item.tripID === trip.id);
    if (existingItem) {
      existingItem.quantity += quantity;

      if (existingItem.quantity > trip.available) {
        return false;
      }

      this.shoppingCartSignal.update((shoppingCart) => {
        shoppingCart.totalPrice += existingItem!.tripPrice * quantity;
        return shoppingCart;
      });

      this.saveCartInSessionStorage();
      return true;
    }

    const ShoppingCartItem: ShoppingCartItem = {
      tripID: trip.id!,
      tripName: trip.name,
      tripDestination: trip.destination,
      tripStartDate: trip.startDate,
      tripEndDate: trip.endDate,
      quantity: quantity,
      tripPrice: trip.price,
      tripCurrency: trip.currency,
      tripAvailable: trip.available,
    };

    this.shoppingCartSignal.update((shoppingCart) => {
      shoppingCart.items.push(ShoppingCartItem);
      shoppingCart.totalPrice += ShoppingCartItem.tripPrice * ShoppingCartItem.quantity;
      return shoppingCart;
    });
    this.saveCartInSessionStorage();
    return true;
  }

  updateQuantity(item: ShoppingCartItem, quantity: number) {
    if (quantity < 0 || quantity > item.tripAvailable) {
      return;
    }

    const oldQuantity = item.quantity;
    item.quantity = quantity;

    this.shoppingCartSignal.update((shoppingCart) => {
      shoppingCart.totalPrice += (quantity - oldQuantity) * item.tripPrice;
      return shoppingCart;
    });

    this.saveCartInSessionStorage();
  }

  saveCartInSessionStorage() {
    sessionStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCartSignal()));
  }

  loadCartFromSessionStorage() {
    // check if there is a shopping cart in session storage
    if (!sessionStorage.getItem('shoppingCart')) {
      return;
    }

    let shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart') || '{}');
    if (!shoppingCart) {
      return;
    }
    this.shoppingCartSignal = signal<ShoppingCart>(shoppingCart);
  }

  removeItem(item: ShoppingCartItem) {
    this.shoppingCartSignal.update((shoppingCart) => {
      shoppingCart.items = shoppingCart.items.filter((i) => i.tripID !== item.tripID);
      shoppingCart.totalPrice -= item.tripPrice * item.quantity;
      return shoppingCart;
    });

    this.saveCartInSessionStorage();
  }

  clearCart() {
    this.shoppingCartSignal.update((shoppingCart) => {
      shoppingCart.items = [];
      shoppingCart.totalPrice = 0;
      return shoppingCart;
    });

    this.saveCartInSessionStorage();
  }
}
