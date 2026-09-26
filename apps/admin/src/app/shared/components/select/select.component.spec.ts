import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('emits the selected string value', () => {
    const component = new SelectComponent();
    let selected = '';

    component.selectedValue.subscribe((value) => (selected = value));
    component.detectChanges({
      target: { value: 'electronics' },
    } as unknown as Event);

    expect(selected).toBe('electronics');
  });
});
