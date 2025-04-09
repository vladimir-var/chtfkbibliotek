import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookSearchComponent } from './pages/book-search/book-search.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { BookReaderComponent } from './pages/book-reader/book-reader.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

// Auth guard function
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAdmin()) {
    return true;
  }
  
  // Redirect to login page
  return router.navigateByUrl('/login');
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'books', component: BookSearchComponent },
  { path: 'book/:id', component: BookDetailsComponent },
  { path: 'book/:id/read', component: BookReaderComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [() => authGuard()]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
