import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  @Input() title = '';
  @Input() data: string[] = [];
  @Input() all = true;
  @Input() select = '';
  @Input() controlId = 'admin-select';
  @Output() selectedValue = new EventEmitter<string>();

  detectChanges(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedValue.emit(select.value);
  }
}
