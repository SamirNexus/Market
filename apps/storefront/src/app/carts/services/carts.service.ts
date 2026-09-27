import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type {
  CreateStorefrontOrderInput,
  StorefrontOrder,
} from '@market/contracts/order';
import { environment } from '../../../environments/environment';
import { CartItem, Product } from '../../products/models/product';

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private readonly storageKey = 'cart';
  private readonly orderUrl = `${environment.apiBaseUrl}/orders`;
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.readCart());

  readonly cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  readonly count$ = new BehaviorSubject<number>(
    this.getItemCount(this.cartSubject.value),
  );

  constructor(private http: HttpClient) {}

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  addItem(product: Product, quantity: number): 'added' | 'updated' {
    const safeQuantity = this.normalizeQuantity(quantity, product.stock);
    const cart = [...this.items];
    const existingIndex = cart.findIndex(({ item }) => item.id === product.id);

    if (existingIndex >= 0) {
      const current = cart[existingIndex];
      cart[existingIndex] = {
        ...current,
        item: product,
        quantity: this.normalizeQuantity(
          current.quantity + safeQuantity,
          product.stock,
        ),
      };
      this.save(cart);
      return 'updated';
    }

    this.save([...cart, { item: product, quantity: safeQuantity }]);
    return 'added';
  }

  updateQuantity(index: number, quantity: number): void {
    const cart = [...this.items];
    const current = cart[index];

    if (!current) return;

    cart[index] = {
      ...current,
      quantity: this.normalizeQuantity(quantity, current.item.stock),
    };
    this.save(cart);
  }

  removeItem(index: number): void {
    this.save(this.items.filter((_, itemIndex) => itemIndex !== index));
  }

  clear(): void {
    this.save([]);
  }

  createOrder(): Observable<StorefrontOrder> {
    const model: CreateStorefrontOrderInput = {
      items: this.items.map(({ item, quantity }) => ({
        productId: item.id,
        quantity,
      })),
    };

    return this.http.post<StorefrontOrder>(this.orderUrl, model);
  }

  private save(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
    this.count$.next(this.getItemCount(cart));
  }

  private readCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((entry): entry is CartItem => this.isValidCartItem(entry))
        .map((entry) => ({
          item: entry.item,
          quantity: this.normalizeQuantity(entry.quantity, entry.item.stock),
        }));
    } catch {
      return [];
    }
  }

  private isValidCartItem(entry: unknown): entry is CartItem {
    if (!entry || typeof entry !== 'object') return false;

    const candidate = entry as Partial<CartItem>;
    const product = candidate.item as Partial<Product> | undefined;

    return !!product
      && typeof product.id === 'string'
      && product.id.length > 0
      && typeof product.title === 'string'
      && Number.isFinite(product.price)
      && typeof product.category === 'string'
      && typeof product.description === 'string'
      && typeof product.image === 'string'
      && typeof product.slug === 'string'
      && typeof product.sku === 'string'
      && Number.isFinite(product.stock)
      && product.stock! >= 0
      && product.status === 'ACTIVE'
      && Number.isFinite(candidate.quantity);
  }

  private normalizeQuantity(quantity: number, stock: number): number {
    const numeric = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
    const available = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;

    if (available === 0) return 1;

    return Math.min(Math.max(1, numeric), available);
  }

  private getItemCount(cart: CartItem[]): number {
    return cart.reduce((count, entry) => count + entry.quantity, 0);
  }
}
