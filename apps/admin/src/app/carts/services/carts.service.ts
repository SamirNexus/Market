import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { AdminCart } from '@market/contracts/cart';
import { environment } from '../../../environments/environment';

export type { AdminCart, CartProductLine } from '@market/contracts/cart';

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/carts`;

  constructor(private http: HttpClient) {}

  getAllCarts(filter?: { start?: string; end?: string }): Observable<AdminCart[]> {
    let params = new HttpParams();

    if (filter?.start) {
      params = params.set('startDate', filter.start);
    }

    if (filter?.end) {
      params = params.set('endDate', filter.end);
    }

    return this.http.get<AdminCart[]>(this.baseUrl, { params });
  }

  deleteCart(id: number): Observable<AdminCart> {
    return this.http.delete<AdminCart>(`${this.baseUrl}/${id}`);
  }
}
