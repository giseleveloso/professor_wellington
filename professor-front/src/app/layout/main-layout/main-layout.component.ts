import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarService.collapsed()">
      <app-sidebar />
      <div class="main-area">
        <app-header [pageTitle]="pageTitle" />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
    }

    .app-layout.sidebar-collapsed .main-area {
      margin-left: var(--sidebar-width-collapsed, 72px);
    }

    .main-content {
      flex: 1;
      padding: 1.5rem;
      background: var(--beige-50);
    }

    @media (max-width: 1024px) {
      .main-area {
        margin-left: 0;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarService = inject(SidebarService);
  pageTitle = 'Dashboard';
}
