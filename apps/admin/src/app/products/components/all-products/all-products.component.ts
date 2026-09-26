import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductInput } from '../../models/product';
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
  base64 = '';
  form!: FormGroup;
  editingProductId: number | null = null;

  constructor(
    private service: ProductsService,
    private build: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.build.group({
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      image: ['', Validators.required],
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

  getImagePath(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.base64 = String(reader.result ?? '');
      this.form.get('image')?.setValue(this.base64);
    };
    reader.readAsDataURL(file);
  }

  beginCreate(): void {
    this.editingProductId = null;
    this.feedbackMessage = '';
    this.base64 = '';
    this.form.reset();
  }

  beginUpdate(item: Product): void {
    this.editingProductId = item.id;
    this.feedbackMessage = '';
    this.form.patchValue({
      title: item.title,
      price: item.price,
      description: item.description,
      image: item.image,
      category: item.category,
    });
    this.base64 = item.image;
  }

  saveProduct(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue() as ProductInput;

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
        this.products = [{ ...created, ...payload }, ...this.products];
        this.feedbackMessage = 'Product created successfully.';
        this.form.reset();
        this.base64 = '';
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
        this.feedbackMessage = 'Product deleted successfully.';
      },
      error: () => {
        this.feedbackMessage = 'Product deletion failed. Please try again.';
      },
    });
  }
}
