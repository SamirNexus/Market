import { Component } from '@angular/core';
import { CartsService } from '../../../carts/services/carts.service';
import { StoreSettingsService } from '../../services/store-settings.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly cartCount$ = this.cartsService.count$;
  readonly settings$ = this.settings.settings$;

  constructor(
    private cartsService: CartsService,
    private settings: StoreSettingsService,
  ) {}
}
