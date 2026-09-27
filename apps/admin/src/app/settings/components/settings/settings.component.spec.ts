import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  const settings = {
    id: 'default' as const,
    storeName: 'Market',
    supportEmail: null,
    currency: 'USD',
    locale: 'en-US',
    logoUrl: null,
    primaryColor: '#111827',
    createdAt: '2026-09-27T00:00:00.000Z',
    updatedAt: '2026-09-27T00:00:00.000Z',
  };

  it('loads settings for an owner and saves normalized values', () => {
    const service = {
      get: jasmine.createSpy('get').and.returnValue(of(settings)),
      update: jasmine.createSpy('update').and.returnValue(of({
        ...settings,
        storeName: 'Samir Market',
        currency: 'EUR',
      })),
    };
    const auth = {
      currentUser: {
        role: 'OWNER',
      },
    };

    const component = new SettingsComponent(
      new FormBuilder(),
      service as never,
      auth as never,
    );

    component.ngOnInit();
    component.form.patchValue({
      storeName: ' Samir Market ',
      currency: 'eur',
    });

    component.save();

    expect(component.canEdit).toBeTrue();
    expect(service.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        storeName: 'Samir Market',
        currency: 'EUR',
      }),
    );
    expect(component.feedbackMessage).toContain('updated');
  });

  it('prevents staff from changing merchant settings', () => {
    const service = {
      get: jasmine.createSpy('get').and.returnValue(of(settings)),
      update: jasmine.createSpy('update').and.returnValue(of(settings)),
    };
    const auth = {
      currentUser: {
        role: 'STAFF',
      },
    };

    const component = new SettingsComponent(
      new FormBuilder(),
      service as never,
      auth as never,
    );

    component.ngOnInit();
    component.save();

    expect(component.canEdit).toBeFalse();
    expect(service.update).not.toHaveBeenCalled();
  });
});
