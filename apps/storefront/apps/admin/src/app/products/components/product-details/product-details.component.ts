import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  data?: Product;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private service: ProductsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isFinite(id) || id <= 0) {
        this.loading = false;
        this.data = undefined;
        this.errorMessage = 'Invalid product id.';
        return;
      }

      this.getProduct(id);
    });
  }

  private getProduct(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getProductById(id).subscribe({
      next: (product) => {
        this.data = product;
        this.loading = false;
      },
      error: () => {
        this.data = undefined;
        this.loading = false;
        this.errorMessage = 'Product details could not be loaded.';
      },
    });
  }
}
