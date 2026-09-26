import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CartProductLine {
  productId: number;
  quantity: number;
}

export interface AdminCart {
  id: number;
  userId: number;
  date: string;
  products: CartProductLine[];
}

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private readonly baseUrl = 'https://fakestoreapi.com/carts';

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
