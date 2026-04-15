import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Upload {
  private apiUrl = `${environment.apiUrl}/uploads`;

  constructor(private http: HttpClient) {}

  getImageUrl(filename: string): string {
    if (!filename) return '';
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    return `${this.apiUrl}/${cleanFilename}`;
  }

  deleteImage(imageUrl: string): Observable<void> {
    const filename = imageUrl.split('/').pop();
    return this.http.delete<void>(`${this.apiUrl}/${filename}`);
  }
}
