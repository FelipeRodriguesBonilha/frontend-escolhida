import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateUserDto, ReturnUserDto, UpdatePasswordDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createUser(userData: CreateUserDto): Observable<ReturnUserDto> {
    return this.http.post<ReturnUserDto>(`${this.apiUrl}/users`, userData);
  }

  getAllUsers(): Observable<ReturnUserDto[]> {
    return this.http.get<ReturnUserDto[]>(`${this.apiUrl}/users`);
  }

  getUserById(userId: string): Observable<ReturnUserDto> {
    return this.http.get<ReturnUserDto>(`${this.apiUrl}/users/${userId}`);
  }

  updatePassword(updateData: UpdatePasswordDto): Observable<ReturnUserDto> {
    return this.http.patch<ReturnUserDto>(`${this.apiUrl}/users`, updateData);
  }
}
