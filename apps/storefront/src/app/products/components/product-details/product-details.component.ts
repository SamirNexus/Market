import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartsService } from '../../../carts/services/carts.service';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  id = '';
  data?: Product;
  loading = true;
  errorMessage = '';
  cartMessage = '';

  constructor(
    private route: ActivatedRoute,
    private service: ProductsService,
    private cartsService: CartsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id')?.trim() ?? '';
      this.getProduct();
    });
  }

  getProduct(): void {
    if (!this.id) {
      this.loading = false;
      this.data = undefined;
      this.errorMessage = 'This product could not be loaded. Please try again.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.service.getProductById(this.id).subscribe({
      next: (product) => {
        this.data = product;
        this.loading = false;
      },
      error: () => {
        this.data = undefined;
        this.loading = false;
        this.errorMessage = 'This product could not be loaded. Please try again.';
      },
    });
  }

  addToCart(): void {
    if (!this.data || this.data.stock <= 0) return;
    this.cartsService.addItem(this.data, 1);
    this.cartMessage = 'Added to your cart.';
  }
}
