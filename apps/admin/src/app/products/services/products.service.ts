import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminProductInput, Product, ProductId } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  getProductsInCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.baseUrl}/category/${encodeURIComponent(category)}`,
    );
  }

  getProductById(id: ProductId): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(payload: AdminProductInput): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  updateProduct(id: ProductId, payload: AdminProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: ProductId): Observable<Product> {
    return this.http.delete<Product>(`${this.baseUrl}/${id}`);
  }
}
