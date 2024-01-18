import { Component, inject  } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  shoppingCartService = inject(ShoppingCartService);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  async onSubmit() : Promise<void> {
    this.userService.login(
      this.loginForm.value.username!,
      this.loginForm.value.password!,
    ).subscribe((resp) => {
      localStorage.setItem('access_token', resp.session.accessToken!);
      localStorage.setItem('access_token_expires_at', resp.session.accessTokenExpiresAt!.toString());
      localStorage.setItem('refresh_token', resp.session.refreshToken!);
      localStorage.setItem('refresh_token_expires_at', resp.session.refreshTokenExpiresAt!.toString());
      localStorage.setItem('session_id', resp.session.sessionID!);

      this.userService.currentUserSignal.set(resp.user);
      this.userService.sessionSignal.set(resp.session);
      this.shoppingCartService.loadCartFromSessionStorage();
      this.router.navigateByUrl('/');
    })
  }

  goToRegisterPage(): void {
    this.router.navigateByUrl('/register');
  }
}
