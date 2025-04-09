import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock admin user
  private users: User[] = [
    { id: 1, username: 'admin', password: 'admin', isAdmin: true }
  ];
  
  constructor() {}
  
  login(username: string, password: string): Observable<boolean> {
    const user = this.users.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return of(true);
    }
    
    return of(false);
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
  }
  
  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }
  
  isAdmin(): boolean {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.isAdmin;
    }
    return false;
  }
  
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }
}
