import { CartsService } from './../../services/carts.service';
import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../../products/models/product';

@Component({
  selector: 'app-cart',
  templateUrl:'./cart.component.html' ,
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartProducts: CartItem[] = [];
  success = false;
  submitting = false;
  orderError = '';

  constructor(private service: CartsService) {}

  get totalPrice(): number {
    return this.cartProducts.reduce((total, entry) => total + entry.item.price * entry.quantity, 0);
  }

  ngOnInit(): void {
    this.service.cart$.subscribe((cart) => (this.cartProducts = cart));
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

  placeOrder(): void {
    const products = this.cartProducts.map(({ item, quantity }) => ({ productId: item.id, quantity }));
    const model = { userId: 5, date: new Date().toISOString(), products };
    this.submitting = true;
    this.success = false;
    this.orderError = '';
    this.service.createOrder(model).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        this.service.clear();
      },
      error: () => {
        this.submitting = false;
        this.orderError = 'Your order could not be placed. Please try again.';
      },
    });
  }
}

