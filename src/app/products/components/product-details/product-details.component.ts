import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { CartsService } from '../../../carts/services/carts.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  id = 0;
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
      this.id = Number(params.get('id'));
      this.getProduct();
    });
  }

  getProduct(): void {
    if (!Number.isFinite(this.id) || this.id <= 0) {
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
    if (!this.data) return;
    this.cartsService.addItem(this.data, 1);
    this.cartMessage = 'Added to your cart.';
  }
}
