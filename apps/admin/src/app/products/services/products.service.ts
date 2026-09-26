import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductInput } from '../models/product';

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

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(payload: ProductInput): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  updateProduct(id: number, payload: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(`${this.baseUrl}/${id}`);
  }
}
