import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { CartsService } from '../../../carts/services/carts.service';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss']
})
export class AllProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  sortBy = 'featured';
  cartMessage = '';

  constructor(
    private productsService: ProductsService,
    private cartsService: CartsService,
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
  }

  get visibleProducts(): Product[] {
    const query = this.searchTerm.trim().toLowerCase();
    const filteredProducts = query ? this.products.filter((product) =>
      `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(query),
    ) : [...this.products];

    return filteredProducts.sort((first, second) => {
      if (this.sortBy === 'price-low') return first.price - second.price;
      if (this.sortBy === 'price-high') return second.price - first.price;
      if (this.sortBy === 'rating') return second.rating.rate - first.rating.rate;
      return first.id - second.id;
    });
  }

  getProducts() {
    this.loadProducts(this.productsService.getAllProducts());
  }

  getCategories() {
    this.productsService.getAllCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => (this.categories = []),
    });
  }

  filterCategory(value: string): void {
    value === 'All' ? this.getProducts() : this.getProductsByCategory(value);
  }

  getProductsByCategory(category: string): void {
    this.loadProducts(this.productsService.getProductsInCategory(category));
  }

  addToCart(event: { item: Product; quantity: number }): void {
    const result = this.cartsService.addItem(event.item, event.quantity);
    this.cartMessage = result === 'added'
      ? `${event.item.title} added to your cart.`
      : `${event.item.title} quantity updated.`;
    window.setTimeout(() => (this.cartMessage = ''), 2500);
  }

  private loadProducts(request: ReturnType<ProductsService['getAllProducts']>): void {
    this.loading = true;
    this.errorMessage = '';
    request.subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'We could not load the catalog. Please check your connection and try again.';
      },
    });
  }
}
