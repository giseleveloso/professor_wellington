import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, professorGuard, alunoGuard, loginGuard } from './auth.guard';

describe('Auth Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'isProfessor',
      'isAluno'
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.isProfessor.and.returnValue(false);
    authServiceSpy.isAluno.and.returnValue(false);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  describe('authGuard', () => {
    it('should return false and redirect to login when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
    });

    it('should return true when authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBeTrue();
    });
  });

  describe('professorGuard', () => {
    it('should return false and redirect when not professor', () => {
      const result = TestBed.runInInjectionContext(() => professorGuard(mockRoute, mockState));
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return true when professor', () => {
      authServiceSpy.isProfessor.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => professorGuard(mockRoute, mockState));
      expect(result).toBeTrue();
    });
  });

  describe('alunoGuard', () => {
    it('should return false and redirect when not aluno', () => {
      const result = TestBed.runInInjectionContext(() => alunoGuard(mockRoute, mockState));
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return true when aluno', () => {
      authServiceSpy.isAluno.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => alunoGuard(mockRoute, mockState));
      expect(result).toBeTrue();
    });
  });

  describe('loginGuard', () => {
    it('should return true when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() => loginGuard(mockRoute, mockState));
      expect(result).toBeTrue();
    });

    it('should return false and redirect when authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => loginGuard(mockRoute, mockState));
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
