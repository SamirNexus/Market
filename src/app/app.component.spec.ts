import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('creates the application shell', () => {
    const app = new AppComponent();

    expect(app).toBeTruthy();
  });
});
