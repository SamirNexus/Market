import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { AllProductsComponent } from './all-products.component';

describe('AllProductsComponent', () => {
  let component: AllProductsComponent;
  let service: jasmine.SpyObj<ProductsService>;

  const product: Product = {
    id: 1,
    title: 'Camera',
    price: 100,
    description: 'Test product',
    category: 'electronics',
    image: 'camera.jpg',
    rating: { rate: 4.5, count: 12 },
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'getAllProducts',
      'getAllCategories',
      'createProduct',
      'updateProduct',
      'deleteProduct',
    ]);

    service.getAllProducts.and.returnValue(of([product]));
    service.getAllCategories.and.returnValue(of(['electronics']));
    service.createProduct.and.returnValue(of({ ...product, id: 2 }));
    service.updateProduct.and.returnValue(of(product));
    service.deleteProduct.and.returnValue(of(product));

    component = new AllProductsComponent(service, new FormBuilder());
    component.ngOnInit();
  });

  it('loads products and categories', () => {
    expect(component.products).toEqual([product]);
    expect(component.categories).toEqual(['electronics']);
    expect(component.loading).toBeFalse();
  });

  it('switches into edit mode and submits an update', () => {
    component.beginUpdate(product);
    component.saveProduct();

    expect(component.editingProductId).toBeNull();
    expect(service.updateProduct).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ title: 'Camera', category: 'electronics' }),
    );
    expect(component.feedbackMessage).toContain('updated');
  });

  it('creates a product from a valid form', () => {
    component.beginCreate();
    component.form.setValue({
      title: 'Doorbell',
      price: 80,
      description: 'Smart doorbell',
      image: 'doorbell.jpg',
      category: 'electronics',
    });

    component.saveProduct();

    expect(service.createProduct).toHaveBeenCalled();
    expect(component.products[0].title).toBe('Doorbell');
    expect(component.feedbackMessage).toContain('created');
  });

  it('removes a deleted product from the current view', () => {
    component.deleteProduct(product);

    expect(service.deleteProduct).toHaveBeenCalledWith(1);
    expect(component.products).toEqual([]);
  });

  it('surfaces catalog loading errors', () => {
    service.getAllProducts.and.returnValue(throwError(() => new Error('failed')));

    component.getProducts();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('could not be loaded');
  });
});
