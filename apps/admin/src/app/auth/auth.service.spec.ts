import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthResponse } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const response: AuthResponse = {
    accessToken: 'access-token',
    tokenType: 'Bearer',
    expiresIn: 900,
    user: {
      id: 'user-1',
      email: 'staff@example.com',
      firstName: 'Store',
      lastName: 'Staff',
      role: 'STAFF',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('keeps the access token in memory after login', () => {
    service.login('staff@example.com', 'password123').subscribe();

    const request = http.expectOne(
      'https://fakestoreapi.com/auth/login',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    request.flush(response);

    expect(service.accessToken).toBe('access-token');
    expect(service.currentUser?.role).toBe('STAFF');
  });

  it('restores an in-memory session through the refresh cookie', () => {
    service.refresh().subscribe();

    const request = http.expectOne(
      'https://fakestoreapi.com/auth/refresh',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    request.flush(response);

    expect(service.accessToken).toBe('access-token');
    expect(service.currentUser?.email).toBe('staff@example.com');
  });

  it('clears the in-memory session explicitly', () => {
    service.login('staff@example.com', 'password123').subscribe();

    http.expectOne('https://fakestoreapi.com/auth/login').flush(response);
    service.clearSession();

    expect(service.accessToken).toBeNull();
    expect(service.currentUser).toBeNull();
  });
});
