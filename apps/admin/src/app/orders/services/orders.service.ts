import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  AdminOrder,
  OrderStatus,
  PaginatedOrders,
} from '@market/contracts/order';
import { environment } from '../../../environments/environment';

export type {
  AdminOrder,
  OrderStatus,
  PaginatedOrders,
} from '@market/contracts/order';

export interface OrderListQuery {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(query: OrderListQuery = {}): Observable<PaginatedOrders> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 25));

    if (query.status) params = params.set('status', query.status);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<PaginatedOrders>(this.baseUrl, { params });
  }

  getOrder(id: string): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(
      `${this.baseUrl}/${id}/status`,
      { status },
    );
  }
}
