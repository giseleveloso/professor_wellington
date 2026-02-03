import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <div class="logo">
            <img src="assets/images/logo-completa.png" alt="ClassHub" class="logo-img" />
          </div>
          <p class="subtitle">Sistema de Gestão para Aprendizado Contínuo</p>
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input 
              type="text" 
              class="form-control"
              [(ngModel)]="username"
              name="username"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Senha</label>
            <input 
              type="password" 
              class="form-control"
              [(ngModel)]="senha"
              name="senha"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Perfil</label>
            <div class="profile-options">
              <label class="profile-option" [class.selected]="perfil === 1">
                <input 
                  type="radio" 
                  name="perfil" 
                  [value]="1" 
                  [(ngModel)]="perfil"
                />
                <span class="option-icon">👨‍🏫</span>
                <span class="option-label">Professor</span>
              </label>
              <label class="profile-option" [class.selected]="perfil === 2">
                <input 
                  type="radio" 
                  name="perfil" 
                  [value]="2" 
                  [(ngModel)]="perfil"
                />
                <span class="option-icon">🎓</span>
                <span class="option-label">Aluno</span>
              </label>
            </div>
          </div>

          @if (error()) {
            <div class="error-message">
              {{ error() }}
            </div>
          }

          <button 
            type="submit" 
            class="btn btn-primary btn-lg login-btn"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Entrando...
            } @else {
              Entrar
            }
          </button>
        </form>

        <div class="login-footer">
          <p class="hint">Dica: Use <strong>professor.wellington</strong> / <strong>123456</strong></p>
        </div>
      </div>

      <div class="login-illustration">
        <div class="illustration-content">
          <div class="floating-cards">
            <div class="float-card card-1">🎓</div>
            <div class="float-card card-2">📖</div>
            <div class="float-card card-3">✨</div>
            <div class="float-card card-4">🌍</div>
          </div>
          <h2>Aprenda idiomas de forma inteligente</h2>
          <p>Gerencie turmas, alunos, pagamentos e acompanhe o progresso dos seus estudantes.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
    }

    .login-container {
      flex: 1;
      max-width: 480px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: var(--white);
    }

    .login-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.25rem;
    }

    .logo-img {
      max-width: 280px;
      height: auto;
    }

    .subtitle {
      color: var(--gray-500);
      font-size: 0.875rem;
      margin-top: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .profile-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .profile-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s;

      input {
        display: none;
      }

      &:hover {
        border-color: var(--primary-light);
      }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-bg);
      }
    }

    .option-icon {
      font-size: 2rem;
    }

    .option-label {
      font-weight: 500;
      color: var(--gray-700);
    }

    .error-message {
      padding: 0.75rem 1rem;
      background: var(--danger-bg);
      color: var(--danger);
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      text-align: center;
    }

    .login-btn {
      width: 100%;
      margin-top: 0.5rem;
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--gray-500);

      strong {
        color: var(--gray-700);
      }
    }

    .login-illustration {
      flex: 1;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    .illustration-content {
      text-align: center;
      color: var(--white);
      max-width: 400px;
      z-index: 1;

      h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--white);
      }

      p {
        font-size: 1.125rem;
        opacity: 0.9;
        line-height: 1.6;
      }
    }

    .floating-cards {
      margin-bottom: 2rem;
      position: relative;
      height: 120px;
    }

    .float-card {
      position: absolute;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      animation: float 3s ease-in-out infinite;
      backdrop-filter: blur(10px);
    }

    .card-1 { left: 20%; top: 0; animation-delay: 0s; }
    .card-2 { left: 50%; top: 20px; animation-delay: 0.5s; }
    .card-3 { left: 80%; top: 10px; animation-delay: 1s; }
    .card-4 { left: 35%; top: 60px; animation-delay: 1.5s; }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    @media (max-width: 1024px) {
      .login-illustration {
        display: none;
      }

      .login-container {
        max-width: 100%;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  senha = '';
  perfil = 1;

  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.username || !this.senha) {
      this.error.set('Preencha todos os campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({
      username: this.username,
      senha: this.senha,
      perfil: this.perfil
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Usuário ou senha incorretos');
      }
    });
  }
}
