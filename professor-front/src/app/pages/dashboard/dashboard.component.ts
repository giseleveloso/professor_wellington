import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Turma, Aluno, Aula, Pagamento } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard fade-in">
      <!-- Saudação -->
      <div class="greeting">
        <h2>Olá, {{ authService.getUserName() }}! 👋</h2>
        <p class="text-muted">{{ getGreetingMessage() }}</p>
      </div>

      <!-- Cards de Estatísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon primary">📅</div>
          <div class="stat-card-value">{{ aulasHoje().length }}</div>
          <div class="stat-card-label">Aulas hoje</div>
        </div>

        @if (authService.isProfessor()) {
          <div class="stat-card">
            <div class="stat-card-icon info">👥</div>
            <div class="stat-card-value">{{ turmas().length }}</div>
            <div class="stat-card-label">Turmas ativas</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon success">🎓</div>
            <div class="stat-card-value">{{ totalAlunos() }}</div>
            <div class="stat-card-label">Alunos matriculados</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon warning">💰</div>
            <div class="stat-card-value">{{ formatCurrency(receitaMensal()) }}</div>
            <div class="stat-card-label">Receita projetada</div>
          </div>
        }
      </div>

      <!-- Agenda do Dia -->
      <div class="card mt-6">
        <div class="card-header">
          <h3 class="card-title">📆 Agenda de Hoje - {{ formatDate(today) }}</h3>
          <a routerLink="/aulas" class="btn btn-outline btn-sm">Ver todas</a>
        </div>

        @if (aulasHoje().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <p>Nenhuma aula agendada para hoje</p>
          </div>
        } @else {
          <div class="agenda-list">
            @for (aula of aulasHoje(); track aula.id) {
              <div class="agenda-item">
                <div class="agenda-time">
                  <span class="time-start">{{ aula.horaInicio }}</span>
                  <span class="time-divider">-</span>
                  <span class="time-end">{{ aula.horaFim || '--:--' }}</span>
                </div>
                <div class="agenda-content">
                  <h4 class="agenda-title">{{ aula.topico }}</h4>
                  <div class="agenda-meta">
                    <span class="badge badge-primary">{{ aula.nomeTurma }}</span>
                    @if (aula.duracaoMinutos) {
                      <span class="text-muted">{{ aula.duracaoMinutos }} min</span>
                    }
                  </div>
                </div>
                @if (authService.isProfessor()) {
                  <div class="agenda-actions">
                    <button class="btn btn-primary btn-sm" (click)="openPresencaModal(aula)">
                      ✅ Registrar Presença
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Pagamentos Pendentes (apenas professor) -->
      @if (authService.isProfessor() && pagamentosPendentes().length > 0) {
        <div class="card mt-6">
          <div class="card-header">
            <h3 class="card-title">⚠️ Pagamentos Pendentes</h3>
            <a routerLink="/pagamentos" class="btn btn-outline btn-sm">Ver todos</a>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Referência</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                @for (pag of pagamentosPendentes().slice(0, 5); track pag.id) {
                  <tr>
                    <td>{{ pag.nomeAluno }}</td>
                    <td>{{ pag.mesReferencia }}/{{ pag.anoReferencia }}</td>
                    <td class="font-semibold">{{ formatCurrency(pag.valor) }}</td>
                    <td>{{ formatDate(pag.dataVencimento) }}</td>
                    <td>
                      <span [class]="'badge badge-' + getStatusClass(pag.status)">
                        {{ pag.status.label }}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn btn-success btn-sm"
                        (click)="marcarComoPago(pag.id)"
                      >
                        Marcar Pago
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Minhas Turmas -->
      @if (authService.isProfessor()) {
        <div class="card mt-6">
          <div class="card-header">
            <h3 class="card-title">👥 Minhas Turmas</h3>
            <a routerLink="/turmas" class="btn btn-primary btn-sm">+ Nova Turma</a>
          </div>

          @if (turmas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📚</span>
              <p>Você ainda não tem turmas cadastradas</p>
              <a routerLink="/turmas" class="btn btn-primary mt-4">Criar primeira turma</a>
            </div>
          } @else {
            <div class="turmas-grid">
              @for (turma of turmas(); track turma.id) {
                <div class="turma-card">
                  <div class="turma-header">
                    <span class="turma-idioma">{{ turma.idioma.label }}</span>
                    <span class="turma-nivel badge badge-info">{{ turma.nivel.label }}</span>
                  </div>
                  <h4 class="turma-nome">{{ turma.nome }}</h4>
                  <div class="turma-info">
                    <span>🕐 {{ turma.horario }}</span>
                    <span>📅 {{ turma.diasSemana }}</span>
                  </div>
                  <div class="turma-footer">
                    <span class="alunos-count">
                      <span class="count">{{ turma.quantidadeAlunos }}</span> alunos
                    </span>
                    <a [routerLink]="['/turmas', turma.id]" class="btn btn-outline btn-sm">
                      Ver detalhes
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal de Presença -->
    @if (showPresencaModal()) {
      <div class="modal-overlay" (click)="closePresencaModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>📋 Registrar Presença</h3>
              <p class="text-muted">{{ aulaPresenca()?.nomeTurma }} - {{ aulaPresenca()?.topico }}</p>
            </div>
            <button class="btn btn-icon" (click)="closePresencaModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="aula-info-bar mb-4">
              <div class="info-item">
                <span class="info-icon">🕐</span>
                <span>{{ aulaPresenca()?.horaInicio }} - {{ aulaPresenca()?.horaFim || '--:--' }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">⏱️</span>
                <span>{{ aulaPresenca()?.duracaoMinutos }} min</span>
              </div>
            </div>

            @if (loadingAlunos()) {
              <div class="loading-state"><span class="spinner"></span></div>
            } @else if (alunosTurma().length === 0) {
              <div class="empty-state-sm">
                <p>Nenhum aluno matriculado nesta turma</p>
              </div>
            } @else {
              <div class="presenca-actions-bar mb-3">
                <button class="btn btn-sm btn-outline" (click)="marcarTodos(true)">✓ Todos presentes</button>
                <button class="btn btn-sm btn-outline" (click)="marcarTodos(false)">✕ Todos ausentes</button>
              </div>
              
              <div class="presenca-list">
                @for (aluno of alunosTurma(); track aluno.id) {
                  <div class="presenca-item">
                    <div class="presenca-aluno">
                      <div class="avatar">{{ getInitials(aluno.nome) }}</div>
                      <div>
                        <div class="font-medium">{{ aluno.nome }}</div>
                        <div class="text-muted text-sm">{{ aluno.email }}</div>
                      </div>
                    </div>
                    <div class="presenca-toggle">
                      <button 
                        class="toggle-btn" 
                        [class.presente]="presencasMap()[aluno.id].presente === true"
                        (click)="togglePresenca(aluno.id, true)"
                      >
                        ✓ Presente
                      </button>
                      <button 
                        class="toggle-btn" 
                        [class.ausente]="presencasMap()[aluno.id].presente === false"
                        (click)="togglePresenca(aluno.id, false)"
                      >
                        ✕ Ausente
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closePresencaModal()">Cancelar</button>
            <button class="btn btn-success" (click)="savePresencas()" [disabled]="savingPresencas()">
              @if (savingPresencas()) {
                <span class="spinner"></span>
              }
              ✓ Salvar Presenças
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .greeting {
      margin-bottom: 1.5rem;
      h2 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;

      @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }

    .agenda-list { display: flex; flex-direction: column; gap: 1rem; }

    .agenda-item {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
      transition: background 0.2s;

      &:hover { background: var(--gray-100); }
    }

    .agenda-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      padding: 0.5rem;
      background: var(--white);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--gray-200);

      .time-start { font-weight: 600; color: var(--primary); }
      .time-divider { color: var(--gray-400); font-size: 0.75rem; }
      .time-end { color: var(--gray-500); font-size: 0.875rem; }
    }

    .agenda-content { flex: 1; }
    .agenda-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
    .agenda-meta { display: flex; align-items: center; gap: 0.75rem; }
    .agenda-actions { display: flex; align-items: center; }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--gray-500);
      .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
      p { font-size: 1rem; }
    }

    .turmas-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;

      @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .turma-card {
      padding: 1.25rem;
      background: var(--gray-50);
      border-radius: var(--border-radius);
      border: 1px solid var(--gray-100);
      transition: all 0.2s;

      &:hover { border-color: var(--primary-light); transform: translateY(-2px); }
    }

    .turma-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .turma-idioma { font-size: 1.5rem; }
    .turma-nome { font-size: 1rem; margin-bottom: 0.75rem; }
    .turma-info { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; color: var(--gray-500); margin-bottom: 1rem; }
    .turma-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--gray-200); }
    .alunos-count { font-size: 0.875rem; color: var(--gray-600); .count { font-weight: 700; color: var(--primary); } }

    // Modal styles
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 650px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--gray-100); }

    .aula-info-bar {
      display: flex;
      gap: 2rem;
      padding: 0.75rem 1rem;
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
    }

    .info-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .info-icon { font-size: 1rem; }

    .presenca-actions-bar { display: flex; gap: 0.5rem; }
    .presenca-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .presenca-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--gray-200);
    }

    .presenca-aluno { display: flex; align-items: center; gap: 0.75rem; }
    .presenca-toggle { display: flex; gap: 0.5rem; }
    .text-sm { font-size: 0.8125rem; }

    .toggle-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--gray-300);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--gray-50); }
      &.presente { background: var(--success); border-color: var(--success); color: white; }
      &.ausente { background: var(--danger); border-color: var(--danger); color: white; }
    }

    .loading-state, .empty-state-sm { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  today = new Date().toISOString().split('T')[0];
  
  turmas = signal<Turma[]>([]);
  aulasHoje = signal<Aula[]>([]);
  pagamentosPendentes = signal<Pagamento[]>([]);
  totalAlunos = signal(0);
  receitaMensal = signal(0);

  // Modal de Presença
  showPresencaModal = signal(false);
  aulaPresenca = signal<Aula | null>(null);
  alunosTurma = signal<Aluno[]>([]);
  presencasMap = signal<{ [alunoId: number]: { presente: boolean } }>({});
  loadingAlunos = signal(false);
  savingPresencas = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Carregar aulas de hoje
    this.apiService.getAulasByData(this.today).subscribe({
      next: (aulas) => this.aulasHoje.set(aulas),
      error: () => {}
    });

    if (this.authService.isProfessor()) {
      // Carregar turmas
      this.apiService.getTurmas().subscribe({
        next: (turmas) => {
          this.turmas.set(turmas);
          this.totalAlunos.set(turmas.reduce((acc, t) => acc + t.quantidadeAlunos, 0));
        },
        error: () => {}
      });

      // Carregar pagamentos pendentes
      this.apiService.getPagamentosPendentes().subscribe({
        next: (pagamentos) => {
          this.pagamentosPendentes.set(pagamentos);
          // Calcular receita mensal
          this.apiService.getPagamentos().subscribe({
            next: (todos) => {
              const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' });
              const anoAtual = new Date().getFullYear();
              const receitaMes = todos
                .filter(p => p.mesReferencia.toLowerCase() === mesAtual.toLowerCase() && p.anoReferencia === anoAtual)
                .reduce((acc, p) => acc + p.valor, 0);
              this.receitaMensal.set(receitaMes);
            }
          });
        },
        error: () => {}
      });
    }
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia! Pronto para mais um dia de aprendizado?';
    if (hour < 18) return 'Boa tarde! Como estão as aulas hoje?';
    return 'Boa noite! Finalizando o dia com sucesso?';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getStatusClass(status: any): string {
    switch (status.id) {
      case 1: return 'warning'; // Pendente
      case 2: return 'success'; // Pago
      case 3: return 'danger';  // Atrasado
      default: return 'secondary';
    }
  }

  marcarComoPago(id: number): void {
    this.apiService.marcarComoPago(id).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  // ======== Funções de Presença ========

  openPresencaModal(aula: Aula): void {
    this.aulaPresenca.set(aula);
    this.showPresencaModal.set(true);
    this.loadAlunosAndPresencas(aula);
  }

  closePresencaModal(): void {
    this.showPresencaModal.set(false);
    this.aulaPresenca.set(null);
    this.alunosTurma.set([]);
    this.presencasMap.set({});
  }

  loadAlunosAndPresencas(aula: Aula): void {
    this.loadingAlunos.set(true);
    this.apiService.getAlunosByTurma(aula.idTurma).subscribe({
      next: alunos => {
        this.alunosTurma.set(alunos);
        
        this.apiService.getPresencasByAula(aula.id).subscribe({
          next: presencas => {
            const map: { [key: number]: { presente: boolean } } = {};
            presencas.forEach(p => {
              map[p.idAluno] = { presente: p.presente };
            });
            alunos.forEach(a => {
              if (!map[a.id]) {
                map[a.id] = { presente: true }; // Default: presente
              }
            });
            this.presencasMap.set(map);
            this.loadingAlunos.set(false);
          },
          error: () => {
            const map: { [key: number]: { presente: boolean } } = {};
            alunos.forEach(a => map[a.id] = { presente: true });
            this.presencasMap.set(map);
            this.loadingAlunos.set(false);
          }
        });
      },
      error: () => this.loadingAlunos.set(false)
    });
  }

  togglePresenca(alunoId: number, presente: boolean): void {
    const current = { ...this.presencasMap() };
    current[alunoId] = { presente };
    this.presencasMap.set(current);
  }

  marcarTodos(presente: boolean): void {
    const map: { [key: number]: { presente: boolean } } = {};
    this.alunosTurma().forEach(a => map[a.id] = { presente });
    this.presencasMap.set(map);
  }

  savePresencas(): void {
    if (!this.aulaPresenca()) return;

    this.savingPresencas.set(true);
    const presencas = Object.entries(this.presencasMap()).map(([alunoId, data]) => ({
      presente: data.presente,
      idAula: this.aulaPresenca()!.id,
      idAluno: parseInt(alunoId)
    }));

    this.apiService.registrarPresencasEmLote(this.aulaPresenca()!.id, presencas).subscribe({
      next: () => {
        this.savingPresencas.set(false);
        this.closePresencaModal();
        alert('Presenças registradas com sucesso!');
      },
      error: () => this.savingPresencas.set(false)
    });
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : nome.substring(0, 2).toUpperCase();
  }
}
