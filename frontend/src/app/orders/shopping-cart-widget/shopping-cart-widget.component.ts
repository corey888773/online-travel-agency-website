import { Component, inject, OnInit} from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { ShoppingCart } from '../shopping-cart';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shopping-cart-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-cart-widget.component.html',
  styleUrl: './shopping-cart-widget.component.css'
})
export class ShoppingCartWidgetComponent implements OnInit{
  userService = inject(UserService);
  shoppingCartService = inject(ShoppingCartService);
  shoppingCart! : ShoppingCart;
  shoppingCart$ = toObservable(this.shoppingCartService.shoppingCartSignal);

  constructor() {
  }

  ngOnInit(): void {
    this.shoppingCart$.subscribe((shoppingCart : ShoppingCart) => {
      this.shoppingCart = shoppingCart;
    });
  }


  goToShoppingCart(): void {
    window.location.href = `/cart`;
  }
}
