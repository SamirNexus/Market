import { Component, OnInit } from '@angular/core';
import { StoreSettingsService } from './shared/services/store-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private settings: StoreSettingsService) {}

  ngOnInit(): void {
    this.settings.load();
  }
}
