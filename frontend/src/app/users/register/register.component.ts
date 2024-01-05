import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', Validators.required, Validators.email],
    fullName: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  onSubmit() : void {
    this.userService.register(
      this.registerForm.value.username!,
      this.registerForm.value.password!,
      this.registerForm.value.email!,
      this.registerForm.value.fullName!
    ).subscribe((user) => {
      this.userService.currentUserSignal.set(user);
      this.router.navigateByUrl('/');
    }
    )
  }
}
