import { Component } from '@angular/core';
import { CartsService } from '../../../carts/services/carts.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly cartCount$ = this.cartsService.count$;
  constructor(private cartsService: CartsService) {}
}
