import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

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
    <aside class="sidebar" [class.collapsed]="sidebarService.collapsed()">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Prof. Wellington</span>
        </div>
        <button class="collapse-btn" (click)="sidebarService.toggle()" [title]="sidebarService.collapsed() ? 'Expandir menu' : 'Recolher menu'">
          <span class="collapse-icon">{{ sidebarService.collapsed() ? '»' : '«' }}</span>
        </button>
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
                  [title]="sidebarService.collapsed() ? item.label : ''"
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
        <button class="logout-btn" (click)="logout()" [title]="sidebarService.collapsed() ? 'Sair' : ''">
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
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: var(--sidebar-width-collapsed, 72px);
    }

    .sidebar-header {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    .logo-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-800);
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .sidebar.collapsed .logo-text {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .collapse-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--gray-200);
      background: var(--white);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--gray-500);
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: var(--gray-50);
        color: var(--gray-700);
        border-color: var(--gray-300);
      }
    }

    .collapse-icon {
      font-weight: bold;
      line-height: 1;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-list {
      list-style: none;
      padding: 0 0.75rem;
    }

    .sidebar.collapsed .nav-list {
      padding: 0 0.5rem;
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
      white-space: nowrap;
      overflow: hidden;

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

    .sidebar.collapsed .nav-link {
      padding: 0.75rem;
      justify-content: center;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 28px;
      text-align: center;
      transition: transform 0.2s;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 0.875rem;
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .sidebar.collapsed .nav-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      position: absolute;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid var(--gray-100);
    }

    .sidebar.collapsed .sidebar-footer {
      padding: 1rem 0.5rem;
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
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        background: var(--danger-bg);
        color: var(--danger);
      }
    }

    .sidebar.collapsed .logout-btn {
      padding: 0.75rem;
      justify-content: center;
    }

    .sidebar.collapsed .logout-btn .nav-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      position: absolute;
    }

    /* Tooltip para modo colapsado */
    .sidebar.collapsed .nav-link:hover::after,
    .sidebar.collapsed .logout-btn:hover::after {
      content: attr(title);
      position: absolute;
      left: calc(var(--sidebar-width-collapsed, 72px) + 8px);
      background: var(--gray-800);
      color: var(--white);
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: 0.75rem;
      white-space: nowrap;
      z-index: 1000;
      box-shadow: var(--shadow-md);
    }

    .sidebar.collapsed .nav-link,
    .sidebar.collapsed .logout-btn {
      position: relative;
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  sidebarService = inject(SidebarService);

  menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/' },
    { icon: '👥', label: 'Turmas', route: '/turmas', professorOnly: true },
    { icon: '🎓', label: 'Alunos', route: '/alunos', professorOnly: true },
    { icon: '📖', label: 'Aulas', route: '/aulas', professorOnly: true },
    { icon: '📅', label: 'Calendário', route: '/calendario', professorOnly: true },
    { icon: '💰', label: 'Pagamentos', route: '/pagamentos' },
    { icon: '🎬', label: 'Vídeos', route: '/videos' },
    { icon: '🏷️', label: 'Categorias', route: '/categorias-video', professorOnly: true },
    { icon: '📊', label: 'Níveis', route: '/niveis', professorOnly: true },
    { icon: '📚', label: 'Materiais', route: '/materiais' },
    { icon: '📈', label: 'Meu Desempenho', route: '/meu-desempenho', alunoOnly: true },
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
