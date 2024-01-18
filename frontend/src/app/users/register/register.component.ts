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

  passwordMinLength = 8;
  passwordLengthError = `Password must be at least ${this.passwordMinLength} characters long!`;
  passwordLengthValid : boolean | undefined = undefined;

  passwordMatchError = 'Passwords do not match!';

  passwordCapitalLetterError = 'Password must contain at least one capital letter!';
  passwordCapitalLetterValid  : boolean | undefined = undefined;
  
  passwordDigitError = 'Password must contain at least one digit!';
  passwordDigitValid : boolean | undefined = undefined;

  passwordSpecialCharacterError = 'Password must contain at least one special character!';
  passwordSpecialCharacterValid : boolean | undefined = undefined;

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  onSubmit() : void {
    this.resetPasswordValidation();

    if (this.registerForm.invalid) {
      alert(this.getValidationErrors());
      console.log(this.registerForm);
      this.resetPasswordInuts();
      return;
    }

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

  validationMatch(left: string, right: string): boolean {
    return this.registerForm.hasError('match', [left, right]);
  }

  getValidationErrors(): string {
    let errors = 'Invalid form! Please check the fields and try again!\n';

    if (this.registerForm.controls.username.errors?.['required']) {
      errors += 'Username is required!\n';
    }

    if (this.registerForm.controls.username.errors?.['minlength']) {
      errors += `Username must be at least ${this.registerForm.controls.username.errors['minlength'].requiredLength} characters long!\n`;
    }

    if (this.registerForm.controls.username.errors?.['maxlength']) {
      errors += `Username must be at most ${this.registerForm.controls.username.errors['maxlength'].requiredLength} characters long!\n`;
    }

    if (this.registerForm.controls.email.errors?.['required']) {
      errors += 'Email is required!\n';
    }

    if (this.registerForm.controls.email.errors?.['email']) {
      errors += 'Email is invalid!\n';
    }

    if (this.registerForm.controls.fullName.errors?.['required']) {
      errors += 'Full name is required!\n';
    }

    if (this.registerForm.controls.password.errors?.['required']) {
      errors += 'Password is required!\n';
    }

    if (this.registerForm.controls.confirmPassword.errors?.['required']) {
      errors += 'Confirm password is required!\n';
    }

    if (this.registerForm.controls.password.errors?.['invalid']) {
      errors += 'Password is invalid!\n';
    }

    if (this.validationMatch('password', 'confirmPassword')) {
      errors += 'Passwords do not match!\n';
    }

    return errors;
  }

  resetPasswordValidation(): void {
    this.passwordLengthValid = undefined;
    this.passwordCapitalLetterValid = undefined;
    this.passwordDigitValid = undefined;
    this.passwordSpecialCharacterValid = undefined;
  }

  resetPasswordInuts(): void {
    this.registerForm.controls.password.setValue('');
    this.registerForm.controls.confirmPassword.setValue('');
  }

  validatePassword(): void {
    if (!this.registerForm.value.password)
    {
      this.resetPasswordValidation();
      return;
    }

    if (this.registerForm.value.password!.length < this.passwordMinLength) {
      this.passwordLengthValid = false;
    }
    else {
      this.passwordLengthValid = true;
    }

    if (!this.registerForm.value.password!.match(/[A-Z]/)) {
      this.passwordCapitalLetterValid = false;
    }
    else {
      this.passwordCapitalLetterValid = true;
    }

    if (!this.registerForm.value.password!.match(/[0-9]/)) {
      this.passwordDigitValid = false;
    }
    else {
      this.passwordDigitValid = true;
    }

    if (!this.registerForm.value.password!.match(/[^A-Za-z0-9]/)) {
      this.passwordSpecialCharacterValid = false;
    }
    else {
      this.passwordSpecialCharacterValid = true;
    }

    if (this.passwordLengthValid && this.passwordCapitalLetterValid && this.passwordDigitValid && this.passwordSpecialCharacterValid) {
      this.registerForm.controls.password.setErrors(null);
    }
    else {
      this.registerForm.controls.password.setErrors({ invalid: true });
    }
  }
}
