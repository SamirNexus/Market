import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../../products/models/product';
import { CartsService } from '../../services/carts.service';
import { StoreSettingsService } from '../../../shared/services/store-settings.service';

@Component({
  selector: 'app-cart',
  templateUrl:'./cart.component.html' ,
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartProducts: CartItem[] = [];
  submitting = false;
  orderError = '';
  confirmedOrderNo = '';
  confirmedTotal = 0;
  confirmedCurrency = 'USD';
  estimatedTax = 0;
  estimatedShipping = 0;
  estimatedTotal = 0;
  readonly currency$ = this.settings.currency$;

  constructor(
    private service: CartsService,
    private settings: StoreSettingsService,
  ) {}

  get totalPrice(): number {
    return this.cartProducts.reduce(
      (total, entry) => total + entry.item.price * entry.quantity,
      0,
    );
  }

  ngOnInit(): void {
    this.service.cart$.subscribe((cart) => {
      this.cartProducts = cart;
      this.updateEstimate();
    });

    this.settings.settings$.subscribe(() => this.updateEstimate());
  }

  changeQuantity(index: number, quantity: number): void {
    this.service.updateQuantity(index, quantity);
  }

  removeProduct(index: number): void {
    this.service.removeItem(index);
  }

  clearCart(): void {
    this.service.clear();
  }

  private updateEstimate(): void {
    const settings = this.settings.currentSettings;
    const subtotal = this.totalPrice;

    if (!settings) {
      this.estimatedTax = 0;
      this.estimatedShipping = 0;
      this.estimatedTotal = subtotal;
      return;
    }

    this.estimatedTax = this.roundMoney(subtotal * settings.taxRate);
    this.estimatedShipping =
      settings.freeShippingThreshold !== null
      && subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.shippingFee;
    this.estimatedTotal = this.roundMoney(
      subtotal + this.estimatedShipping + this.estimatedTax,
    );
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  placeOrder(): void {
    if (this.cartProducts.length === 0 || this.submitting) return;

    this.submitting = true;
    this.orderError = '';
    this.confirmedOrderNo = '';

    this.service.createOrder().subscribe({
      next: (order) => {
        this.submitting = false;
        this.confirmedOrderNo = order.orderNo;
        this.confirmedTotal = order.total;
        this.confirmedCurrency = order.currency;
        this.service.clear();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.submitting = false;
        const message = error.error?.message;
        this.orderError = Array.isArray(message)
          ? message.join(' ')
          : message || 'Your order could not be placed. Please review availability and try again.';
      },
    });
  }
}
