import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Product } from '../../../products/models/product';
import { ProductsService } from '../../../products/services/products.service';
import { AdminCart, CartsService } from '../../services/carts.service';

interface CartDetailLine {
  item: Product;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  carts: AdminCart[] = [];
  form!: FormGroup;
  products: CartDetailLine[] = [];
  details?: AdminCart;
  loading = false;
  detailLoading = false;
  errorMessage = '';
  feedbackMessage = '';

  constructor(
    private service: CartsService,
    private build: FormBuilder,
    private productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    this.form = this.build.group({
      start: [''],
      end: [''],
    });

    this.getAllCarts();
  }

  getAllCarts(): void {
    this.loadCarts();
  }

  applyFilter(): void {
    this.loadCarts(this.form.value);
  }

  clearFilter(): void {
    this.form.reset();
    this.loadCarts();
  }

  deleteCart(id: number): void {
    this.feedbackMessage = '';

    this.service.deleteCart(id).subscribe({
      next: () => {
        this.carts = this.carts.filter((cart) => cart.id !== id);
        this.feedbackMessage = 'Cart deleted successfully.';
      },
      error: () => {
        this.feedbackMessage = 'Cart deletion failed. Please try again.';
      },
    });
  }

  view(index: number): void {
    const cart = this.carts[index];
    if (!cart) return;

    this.details = cart;
    this.products = [];
    this.detailLoading = true;

    const requests = cart.products.map((line) =>
      this.productsService.getProductById(line.productId),
    );

    if (requests.length === 0) {
      this.detailLoading = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: (products) => {
        this.products = products.map((product, productIndex) => ({
          item: product,
          quantity: cart.products[productIndex].quantity,
        }));
        this.detailLoading = false;
      },
      error: () => {
        this.detailLoading = false;
        this.feedbackMessage = 'Cart details could not be loaded.';
      },
    });
  }

  private loadCarts(filter?: { start?: string; end?: string }): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getAllCarts(filter).subscribe({
      next: (carts) => {
        this.carts = carts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Carts could not be loaded. Please try again.';
      },
    });
  }
}
