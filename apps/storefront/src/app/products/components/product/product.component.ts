import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent {
  @Input() data!: Product;
  @Output() item = new EventEmitter<{ item: Product; quantity: number }>();

  selectingQuantity = false;
  amount = 1;

  add(): void {
    this.item.emit({ item: this.data, quantity: Math.max(1, this.amount) });
    this.amount = 1;
    this.selectingQuantity = false;
  }
}
