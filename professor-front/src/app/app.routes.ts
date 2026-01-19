import { Routes } from '@angular/router';
import { authGuard, loginGuard, professorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'turmas',
        loadComponent: () => import('./pages/turmas/turmas.component').then(m => m.TurmasComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'alunos',
        loadComponent: () => import('./pages/alunos/alunos.component').then(m => m.AlunosComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'aulas',
        loadComponent: () => import('./pages/aulas/aulas.component').then(m => m.AulasComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/calendario/calendario.component').then(m => m.CalendarioComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'pagamentos',
        loadComponent: () => import('./pages/pagamentos/pagamentos.component').then(m => m.PagamentosComponent)
      },
      {
        path: 'videos',
        loadComponent: () => import('./pages/videos/videos.component').then(m => m.VideosComponent)
      },
      {
        path: 'categorias-video',
        loadComponent: () => import('./pages/categorias-video/categorias-video.component').then(m => m.CategoriasVideoComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'niveis',
        loadComponent: () => import('./pages/niveis/niveis.component').then(m => m.NiveisComponent),
        canActivate: [professorGuard]
      },
      {
        path: 'materiais',
        loadComponent: () => import('./pages/materiais/materiais.component').then(m => m.MateriaisComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
