import { Product } from '../../models/product';
import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
  const product: Product = {
    id: 'product-1',
    title: 'Test product',
    slug: 'test-product',
    sku: 'TEST-001',
    stock: 5,
    status: 'ACTIVE' as const,
    price: 99,
    category: 'electronics',
    description: 'Test description',
    image: 'https://example.com/product.jpg',
  };

  it('emits the selected product and a normalized quantity', () => {
    const component = new ProductComponent();
    component.data = product;
    component.amount = 0;

    const emitted: Array<{ item: Product; quantity: number }> = [];
    component.item.subscribe((value) => emitted.push(value));

    component.add();

    expect(emitted).toEqual([{ item: product, quantity: 1 }]);
    expect(component.amount).toBe(1);
    expect(component.selectingQuantity).toBeFalse();
  });

  it('caps requested quantity at current stock', () => {
    const component = new ProductComponent();
    component.data = product;
    component.amount = 99;

    const emitted: Array<{ item: Product; quantity: number }> = [];
    component.item.subscribe((value) => emitted.push(value));

    component.add();

    expect(emitted[0].quantity).toBe(product.stock);
  });

  it('does not emit for an out-of-stock item', () => {
    const component = new ProductComponent();
    component.data = { ...product, stock: 0 };

    const emitted: Array<{ item: Product; quantity: number }> = [];
    component.item.subscribe((value) => emitted.push(value));

    component.add();

    expect(emitted).toEqual([]);
  });
});
