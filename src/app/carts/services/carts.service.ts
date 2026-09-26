import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product } from '../../products/models/product';

@Injectable({
  providedIn: 'root'
})
export class CartsService {
  private readonly storageKey = 'cart';
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.readCart());
  readonly cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  readonly count$ = new BehaviorSubject<number>(this.getItemCount(this.cartSubject.value));

  constructor(private http: HttpClient) {}

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  addItem(product: Product, quantity: number): 'added' | 'updated' {
    const safeQuantity = Math.max(1, Math.floor(quantity || 1));
    const cart = [...this.items];
    const existingIndex = cart.findIndex(({ item }) => item.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: cart[existingIndex].quantity + safeQuantity,
      };
      this.save(cart);
      return 'updated';
    }

    this.save([...cart, { item: product, quantity: safeQuantity }]);
    return 'added';
  }

  updateQuantity(index: number, quantity: number): void {
    const cart = [...this.items];
    if (!cart[index]) return;
    cart[index] = { ...cart[index], quantity: Math.max(1, Math.floor(quantity || 1)) };
    this.save(cart);
  }

  removeItem(index: number): void {
    this.save(this.items.filter((_, itemIndex) => itemIndex !== index));
  }

  clear(): void {
    this.save([]);
  }

  createOrder(model: unknown) {
    return this.http.post('https://fakestoreapi.com/carts', model);
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
          quantity: Math.max(1, Math.floor(entry.quantity)),
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
      && Number.isFinite(product.id)
      && typeof product.title === 'string'
      && Number.isFinite(product.price)
      && typeof product.category === 'string'
      && typeof product.description === 'string'
      && typeof product.image === 'string'
      && !!product.rating
      && Number.isFinite(product.rating.rate)
      && Number.isFinite(product.rating.count)
      && Number.isFinite(candidate.quantity);
  }

  private getItemCount(cart: CartItem[]): number {
    return cart.reduce((count, entry) => count + entry.quantity, 0);
  }
}
