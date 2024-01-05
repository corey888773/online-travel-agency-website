import { Component, inject, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { OffersComponent } from './offers/offers.component';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HomeComponent, OffersComponent, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  userService = inject(UserService);
  title = 'biuro_turystyczne';

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
      }}
    );
    
  }

  logout(): void {
    this.userService.logout();
  }
}
