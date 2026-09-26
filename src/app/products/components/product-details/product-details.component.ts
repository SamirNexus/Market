import { Component,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { CartsService } from '../../../carts/services/carts.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent  implements OnInit {
  id = Number(this.route.snapshot.paramMap.get('id'));
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
    this.getProduct();
  }

  getProduct(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getProductById(this.id).subscribe({
      next: (product) => {
        this.data = product;
        this.loading = false;
      },
      error: () => {
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
