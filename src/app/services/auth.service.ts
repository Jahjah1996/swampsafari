import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
private readonly api = `${environment.apiBaseUrl}`;
  private readonly tokenKey = 'swamp_token';
  private readonly authStateSubject = new BehaviorSubject<boolean>(this.hasToken());

  readonly authState$ = this.authStateSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res.token)));
  }

  register(email: string, password: string): Observable<{ id: number; email: string }> {
    return this.http.post<{ id: number; email: string }>(`${this.api}/auth/register`, {
      email,
      password
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authStateSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setSession(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authStateSubject.next(true);
  }

  private hasToken(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }
}
