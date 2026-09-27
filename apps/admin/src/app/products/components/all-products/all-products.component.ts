import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AdminProductInput,
  Product,
  ProductId,
} from '../../models/product';
import { ProductsService } from '../../services/products.service';

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
  categoryError = '';
  feedbackMessage = '';
  form!: FormGroup;
  editingProductId: ProductId | null = null;

  constructor(
    private service: ProductsService,
    private build: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.build.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      sku: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      image: [''],
      category: ['', Validators.required],
    });

    this.getProducts();
    this.getCategories();
  }

  get isEditing(): boolean {
    return this.editingProductId !== null;
  }

  getProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Products could not be loaded. Please try again.';
      },
    });
  }

  getCategories(): void {
    this.categoryError = '';

    this.service.getAllCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => {
        this.categories = [];
        this.categoryError = 'Categories are temporarily unavailable.';
      },
    });
  }

  getSelectedCategory(category: string): void {
    this.form.get('category')?.setValue(category);
  }

  beginCreate(): void {
    this.editingProductId = null;
    this.feedbackMessage = '';
    this.form.reset({ stock: 0, image: '' });
  }

  beginUpdate(item: Product): void {
    this.editingProductId = item.id;
    this.feedbackMessage = '';
    this.form.patchValue({
      title: item.title,
      slug: item.slug ?? '',
      sku: item.sku ?? '',
      price: item.price,
      stock: item.stock ?? 0,
      description: item.description,
      image: item.image ?? '',
      category: item.category,
    });
  }

  saveProduct(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: AdminProductInput = {
      title: raw.title,
      slug: raw.slug,
      sku: raw.sku,
      price: Number(raw.price),
      stock: Number(raw.stock),
      description: raw.description,
      category: raw.category,
      ...(raw.image ? { image: raw.image } : {}),
    };

    if (this.editingProductId !== null) {
      const id = this.editingProductId;
      this.service.updateProduct(id, payload).subscribe({
        next: (updated) => {
          this.products = this.products.map((product) =>
            product.id === id ? { ...product, ...updated, id } : product,
          );
          this.feedbackMessage = 'Product updated successfully.';
          this.editingProductId = null;
        },
        error: () => {
          this.feedbackMessage = 'Product update failed. Please try again.';
        },
      });
      return;
    }

    this.service.createProduct(payload).subscribe({
      next: (created) => {
        this.products = [created, ...this.products];
        this.feedbackMessage = 'Product created successfully.';
        this.form.reset({ stock: 0, image: '' });
      },
      error: () => {
        this.feedbackMessage = 'Product creation failed. Please try again.';
      },
    });
  }

  deleteProduct(item: Product): void {
    this.service.deleteProduct(item.id).subscribe({
      next: () => {
        this.products = this.products.filter((product) => product.id !== item.id);
        this.feedbackMessage = 'Product archived successfully.';
      },
      error: () => {
        this.feedbackMessage = 'Product archival failed. Please try again.';
      },
    });
  }
}
