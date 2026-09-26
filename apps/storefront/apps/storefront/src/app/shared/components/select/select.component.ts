import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  @Input() title: string = '';
  @Input() data: string[] = [];
  @Input() controlId: string = 'shared-select';
  @Output() selectedValue = new EventEmitter<string>();

  onSelectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedValue.emit(selectElement.value);
  }
}
