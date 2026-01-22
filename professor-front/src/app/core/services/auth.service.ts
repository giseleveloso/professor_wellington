import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private userSignal = signal<User | null>(this.loadUserFromStorage());
  
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal());
  isProfessor = computed(() => Number(this.userSignal()?.perfil) === 1);
  isAluno = computed(() => Number(this.userSignal()?.perfil) === 2);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private loadUserFromStorage(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // Garantir que perfil seja número
      user.perfil = Number(user.perfil);
      return user;
    }
    return null;
  }

  login(credentials: AuthRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, credentials, { observe: 'response' }).pipe(
      tap((response: any) => {
        const token = response.headers.get('Authorization');
        const user: User = {
          ...response.body,
          perfil: Number(credentials.perfil),
          token
        };

        this.userSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token || '');
      })
    ) as any;
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserName(): string {
    return this.userSignal()?.nome || '';
  }

  getInitials(): string {
    const nome = this.userSignal()?.nome || '';
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }
}
