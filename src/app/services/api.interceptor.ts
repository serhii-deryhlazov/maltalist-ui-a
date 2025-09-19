import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add API base URL if the request doesn't already have a full URL
    if (!req.url.startsWith('http')) {
      const apiReq = req.clone({
        url: `${environment.apiUrl}${req.url}`
      });
      return next.handle(apiReq);
    }
    return next.handle(req);
  }
}
