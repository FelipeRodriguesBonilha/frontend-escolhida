import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginDto, ReturnLoginDto, ReturnUserDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient) { }

  login(loginData: LoginDto): Observable<ReturnLoginDto> {
    return this.http.post<ReturnLoginDto>(`${this.apiUrl}/auth/login`, loginData);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): ReturnUserDto | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) return false;
    if (this.isTokenExpired()) return false;

    return true;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  saveAuthData(response: ReturnLoginDto): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  clearAuthData(): void {
    this.logout();
  }
}
