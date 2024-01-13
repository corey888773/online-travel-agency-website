import { Component, inject, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { OffersPageComponent } from './trips/offers-page/offers-page.component';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from './services/user.service';
import { ShoppingCartWidgetComponent } from './orders/shopping-cart-widget/shopping-cart-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HomeComponent, OffersPageComponent, RouterLink, RouterLinkActive, ShoppingCartWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  userService = inject(UserService);
  title = 'biuro_turystyczne';

  IGNORE_SHOPPING_CART_PAGES = ['/cart', '/trips/add', 'trips/update']

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId))
      return;

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userService.currentUserSignal.set(user);
      },
      error: () => {
        this.userService.currentUserSignal.set(null);
        }
      }
    );
  }

  canViewManagePaths(): boolean {
    return this.userService.currentUserSignal()?.role === 'admin';
  }

  logout(): void {
    this.userService.logout();
  }

  shouldDisplayCartWidget(): boolean {
    for (let page of this.IGNORE_SHOPPING_CART_PAGES) {
      if (window.location.pathname.includes(page))
        return false;
    }
    return true;
  }
}
