import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="header-right">
        <button class="notification-btn">
          <span>🔔</span>
        </button>

        <div class="user-menu">
          <div class="avatar">
            {{ authService.getInitials() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authService.getUserName() }}</span>
            <span class="user-role">{{ authService.isProfessor() ? 'Professor' : 'Aluno' }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--white);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-800);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--gray-50);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-100);
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--gray-50);
      }
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--gray-800);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    @media (max-width: 768px) {
      .user-info {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  authService = inject(AuthService);
}
