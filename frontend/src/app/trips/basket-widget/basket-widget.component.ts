import { Component, Input } from '@angular/core';
import { Basket } from '../../interfaces/basket';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-basket-widget',
  standalone: true,
  imports: [],
  templateUrl: './basket-widget.component.html',
  styleUrl: './basket-widget.component.css'
})
export class BasketWidgetComponent {
  basket!: Basket;

  constructor(private apiService: ApiService) {
      this.basket = apiService.getBasket();
    }
}
