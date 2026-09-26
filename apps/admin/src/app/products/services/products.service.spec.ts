import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product, ProductInput } from '../models/product';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let http: HttpTestingController;

  const product: Product = {
    id: 1,
    title: 'Camera',
    price: 100,
    description: 'Test product',
    category: 'electronics',
    image: 'camera.jpg',
    rating: { rate: 4.5, count: 12 },
  };

  const payload: ProductInput = {
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.image,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the product catalog', () => {
    service.getAllProducts().subscribe((products) => expect(products).toEqual([product]));

    const request = http.expectOne('https://fakestoreapi.com/products');
    expect(request.request.method).toBe('GET');
    request.flush([product]);
  });

  it('loads categories', () => {
    service.getAllCategories().subscribe((categories) => expect(categories).toEqual(['electronics']));

    const request = http.expectOne('https://fakestoreapi.com/products/categories');
    expect(request.request.method).toBe('GET');
    request.flush(['electronics']);
  });

  it('creates a product with POST', () => {
    service.createProduct(payload).subscribe();

    const request = http.expectOne('https://fakestoreapi.com/products');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(product);
  });

  it('updates a product with PUT', () => {
    service.updateProduct(1, payload).subscribe();

    const request = http.expectOne('https://fakestoreapi.com/products/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(product);
  });

  it('deletes a product', () => {
    service.deleteProduct(1).subscribe();

    const request = http.expectOne('https://fakestoreapi.com/products/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(product);
  });
});
