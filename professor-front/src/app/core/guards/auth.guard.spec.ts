import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, professorGuard, alunoGuard, loginGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('Auth Guards', () => {
  let authService: AuthService;
  let router: Router;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/test' } as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('authGuard', () => {
    it('should return false when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBeFalse();
    });

    it('should redirect to login when not authenticated', () => {
      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/test' } });
    });
  });

  describe('loginGuard', () => {
    it('should return true when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() => loginGuard(mockRoute, mockState));
      expect(result).toBeTrue();
    });
  });

  describe('professorGuard', () => {
    it('should return false when not professor', () => {
      const result = TestBed.runInInjectionContext(() => professorGuard(mockRoute, mockState));
      expect(result).toBeFalse();
    });
  });

  describe('alunoGuard', () => {
    it('should return false when not aluno', () => {
      const result = TestBed.runInInjectionContext(() => alunoGuard(mockRoute, mockState));
      expect(result).toBeFalse();
    });
  });
});
