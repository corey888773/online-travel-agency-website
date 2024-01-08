import { Component, inject } from '@angular/core';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { ShoppingCart } from '../shopping-cart';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-cart-widget.component.html',
  styleUrl: './shopping-cart-widget.component.css'
})
export class ShoppingCartWidgetComponent {
  userService = inject(UserService);
  shoppingCartService = inject(ShoppingCartService);
  shoppingCart! : ShoppingCart;

  ngOnInit(): void {
    this.shoppingCart = this.shoppingCartService.shoppingCartSignal();
  }

  goToShoppingCart(): void {
    window.location.href = `/cart`;
  }
}
