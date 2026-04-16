import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Upload {
  private apiUrl = `${environment.apiUrl}/uploads`;
  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  getImageUrl(filename: string): string {
    if (!filename) return '';
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    return `${this.apiUrl}/${cleanFilename}`;
  }

  getSecureImageUrl(filename: string): Observable<string> {
    if (!filename) return of('');
    
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    
    if (this.imageCache.has(cleanFilename)) {
      return of(this.imageCache.get(cleanFilename)!);
    }

    return this.http.get(`${this.apiUrl}/${cleanFilename}`, { 
      responseType: 'blob' 
    }).pipe(
      map(blob => {
        const objectUrl = URL.createObjectURL(blob);
        this.imageCache.set(cleanFilename, objectUrl);
        return objectUrl;
      }),
      catchError(() => of(''))
    );
  }

  deleteImage(imageUrl: string): Observable<void> {
    const filename = imageUrl.split('/').pop();
    return this.http.delete<void>(`${this.apiUrl}/${filename}`);
  }

  clearImageCache(): void {
    this.imageCache.forEach(url => URL.revokeObjectURL(url));
    this.imageCache.clear();
  }
}
