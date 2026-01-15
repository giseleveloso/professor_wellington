import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  professorOnly?: boolean;
  alunoOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Prof. Wellington</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          @for (item of menuItems; track item.route) {
            @if (shouldShowItem(item)) {
              <li class="nav-item">
                <a 
                  [routerLink]="item.route" 
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.route === '/' }"
                  class="nav-link"
                >
                  <span class="nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              </li>
            }
          }
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Sair</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--white);
      border-right: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-800);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0 0.75rem;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--border-radius-sm);
      color: var(--gray-600);
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;

      &:hover {
        background: var(--gray-50);
        color: var(--gray-800);
      }

      &.active {
        background: var(--primary-bg);
        color: var(--primary);

        .nav-icon {
          transform: scale(1.1);
        }
      }
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 28px;
      text-align: center;
      transition: transform 0.2s;
    }

    .nav-label {
      font-size: 0.875rem;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid var(--gray-100);
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--border-radius-sm);
      background: transparent;
      border: none;
      color: var(--gray-600);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;

      &:hover {
        background: var(--danger-bg);
        color: var(--danger);
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/' },
    { icon: '👥', label: 'Turmas', route: '/turmas', professorOnly: true },
    { icon: '🎓', label: 'Alunos', route: '/alunos', professorOnly: true },
    { icon: '📖', label: 'Aulas', route: '/aulas', professorOnly: true },
    { icon: '📅', label: 'Calendário', route: '/calendario', professorOnly: true },
    { icon: '💰', label: 'Pagamentos', route: '/pagamentos' },
    { icon: '🎬', label: 'Vídeos', route: '/videos' },
    { icon: '🏷️', label: 'Categorias', route: '/categorias-video', professorOnly: true },
    { icon: '📚', label: 'Materiais', route: '/materiais' },
    { icon: '📊', label: 'Meu Desempenho', route: '/meu-desempenho', alunoOnly: true },
  ];

  shouldShowItem(item: MenuItem): boolean {
    if (item.professorOnly && !this.authService.isProfessor()) return false;
    if (item.alunoOnly && !this.authService.isAluno()) return false;
    return true;
  }

  logout(): void {
    this.authService.logout();
  }
}
