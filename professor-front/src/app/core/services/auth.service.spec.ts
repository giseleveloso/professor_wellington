import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start not authenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });

  it('should return empty string for getUserName when not logged in', () => {
    expect(service.getUserName()).toBe('');
  });

  it('should return null for getToken when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should call POST /auth on login', () => {
    const credentials = { username: 'test', senha: '123456', perfil: 1 };
    service.login(credentials).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
  });

  it('should clear localStorage and navigate to login on logout', () => {
    localStorage.setItem('user', '{"nome":"Test"}');
    localStorage.setItem('token', 'abc');

    service.logout();

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
