import { Injectable, signal, inject} from '@angular/core';
import { ShoppingCart } from '../orders/shopping-cart';
import { Trip } from '../trips/trip';
import { ShoppingCartItem } from '../orders/shopping-cart';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService{
  shoppingCartSignal = signal<ShoppingCart> ({
    username: '',
    items: [],
    totalPrice: 0,
    currency: 'USD',
  });

  userService = inject(UserService);

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
    let username = this.userService.currentUserSignal()?.username;
    if (!username) {
      return;
    }

    this.shoppingCartSignal.update((shoppingCart) => {
      shoppingCart.username = username!;
      return shoppingCart;
    });

    sessionStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCartSignal()));
  }

  async loadCartFromSessionStorage() {
    let user = this.userService.currentUserSignal();
    let shoppingCartJson = sessionStorage.getItem('shopping_cart');

    let counter = 0;
    // workaround
    while (!user && counter < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      counter++;
      user = this.userService.currentUserSignal();
    }

    console.log(user);
    console.log(shoppingCartJson);

    // check if there is a shopping cart in session storage
    if (!shoppingCartJson || !user) {
      this.clearCart();
      return;
    }

    let savedCart = JSON.parse(sessionStorage.getItem('shopping_cart') || '{}');
    if (!savedCart) {
      this.clearCart();
      return;
    }

    console.log(user);
    console.log(savedCart);

    if (savedCart.username !== user!.username) {
      this.clearCart();
      return;
    }

    this.shoppingCartSignal.set(savedCart);
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
      shoppingCart.username = '';
      shoppingCart.currency = 'USD';
      return shoppingCart;
    });

    this.saveCartInSessionStorage();
  }
}
