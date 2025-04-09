import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Будь ласка, введіть логін та пароль';
      return;
    }

    this.errorMessage = '';
    const success = this.authService.login(this.username, this.password);
    
    if (success) {
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = 'Невірний логін або пароль';
    }
  }
}
