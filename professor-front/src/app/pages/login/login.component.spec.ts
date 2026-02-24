import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.username).toBe('');
    expect(component.senha).toBe('');
    expect(component.perfil).toBe(1);
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('');
  });

  it('should show error when submitting empty fields', () => {
    component.onSubmit();
    expect(component.error()).toBe('Preencha todos os campos');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should show error when username is empty', () => {
    component.senha = '123456';
    component.onSubmit();
    expect(component.error()).toBe('Preencha todos os campos');
  });

  it('should show error when senha is empty', () => {
    component.username = 'user';
    component.onSubmit();
    expect(component.error()).toBe('Preencha todos os campos');
  });

  it('should call login and navigate on success', () => {
    authServiceSpy.login.and.returnValue(of({} as any));
    component.username = 'prof1';
    component.senha = '123456';
    component.perfil = 1;

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'prof1',
      senha: '123456',
      perfil: 1
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set loading to true during login', () => {
    authServiceSpy.login.and.returnValue(of({} as any));
    component.username = 'prof1';
    component.senha = '123456';

    component.onSubmit();

    expect(component.loading()).toBeTrue();
  });

  it('should show error on login failure', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Unauthorized')));
    component.username = 'prof1';
    component.senha = 'wrongpass';

    component.onSubmit();

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('Usuário ou senha incorretos');
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-form')).toBeTruthy();
    expect(compiled.querySelector('input[name="username"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="senha"]')).toBeTruthy();
  });

  it('should render profile options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const options = compiled.querySelectorAll('.profile-option');
    expect(options.length).toBe(2);
  });
});
