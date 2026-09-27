import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('loads merchant settings when the application shell starts', () => {
    const settings = {
      load: jasmine.createSpy('load'),
    };

    const app = new AppComponent(settings as never);
    app.ngOnInit();

    expect(app).toBeTruthy();
    expect(settings.load).toHaveBeenCalled();
  });
});
