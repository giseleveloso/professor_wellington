import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Presenca, Desempenho, Turma, Aluno } from '../../core/models/user.model';

@Component({
  selector: 'app-meu-desempenho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Meu Desempenho</h2>
          <p class="text-muted">Acompanhe suas presenças, notas e progresso</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando dados...</p>
        </div>
      } @else {
        <!-- Cards de Resumo -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-icon primary">📊</div>
            <div class="stat-card-value">{{ taxaPresenca() }}%</div>
            <div class="stat-card-label">Taxa de Presença</div>
            <div class="stat-card-detail">
              {{ totalPresencas() }} presenças / {{ totalAulas() }} aulas
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon success">✅</div>
            <div class="stat-card-value">{{ totalPresencas() }}</div>
            <div class="stat-card-label">Presenças</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon danger">❌</div>
            <div class="stat-card-value">{{ totalFaltas() }}</div>
            <div class="stat-card-label">Faltas</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-icon warning">📝</div>
            <div class="stat-card-value">{{ mediaNotas() | number:'1.1-1' }}</div>
            <div class="stat-card-label">Média das Notas</div>
          </div>
        </div>

        <!-- Tabs de Conteúdo -->
        <div class="content-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'presencas'"
            (click)="activeTab = 'presencas'"
          >
            📋 Presenças
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'notas'"
            (click)="activeTab = 'notas'"
          >
            ⭐ Notas e Feedback
          </button>
        </div>

        <!-- Tab: Presenças -->
        @if (activeTab === 'presencas') {
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Histórico de Presenças</h4>
              <div class="filter-group">
                <select class="form-control" [(ngModel)]="filtroTurma" (change)="filtrarPresencas()">
                  <option [value]="0">Todas as Turmas</option>
                  @for (turma of turmas(); track turma.id) {
                    <option [value]="turma.id">{{ turma.nome }}</option>
                  }
                </select>
              </div>
            </div>

            @if (presencasFiltradas().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>Nenhum registro de presença encontrado</p>
              </div>
            } @else {
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Aula</th>
                      <th>Status</th>
                      <th>Dever de Casa</th>
                      <th>Preparação</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (presenca of presencasFiltradas(); track presenca.id) {
                      <tr>
                        <td>{{ formatData(presenca.dataAula) }}</td>
                        <td>
                          <div class="aula-info">
                            <span class="font-semibold">{{ presenca.topicoAula }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="status-badge" [class]="'status-' + presenca.status">
                            {{ getStatusLabel(presenca.status) }}
                          </span>
                        </td>
                        <td>
                          <span class="status-badge" [class]="'dever-' + presenca.deverCasa">
                            {{ getDeverLabel(presenca.deverCasa) }}
                          </span>
                        </td>
                        <td>
                          <span class="status-badge" [class]="'prep-' + presenca.preparacaoAula">
                            {{ getPrepLabel(presenca.preparacaoAula) }}
                          </span>
                        </td>
                        <td>
                          @if (presenca.observacao) {
                            <span class="observacao-text">{{ presenca.observacao }}</span>
                          } @else {
                            <span class="text-muted">-</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Tab: Notas -->
        @if (activeTab === 'notas') {
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Notas e Feedbacks</h4>
            </div>

            @if (desempenhos().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>Nenhuma avaliação registrada ainda</p>
              </div>
            } @else {
              <div class="notas-grid">
                @for (desempenho of desempenhos(); track desempenho.id) {
                  <div class="nota-card">
                    <div class="nota-header">
                      <div class="nota-data">{{ formatData(desempenho.dataAula) }}</div>
                      <div class="nota-valor" [class]="getNotaClass(desempenho.nota)">
                        {{ desempenho.nota | number:'1.1-1' }}
                      </div>
                    </div>
                    <div class="nota-aula">{{ desempenho.topicoAula }}</div>
                    @if (desempenho.comentario) {
                      <div class="nota-comentario">
                        <span class="comentario-label">Feedback do professor:</span>
                        <p>{{ desempenho.comentario }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;

      h2 {
        margin-bottom: 0.25rem;
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // Stats Grid
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: var(--white);
      border-radius: var(--border-radius);
      padding: 1.25rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);
    }

    .stat-card-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-bottom: 0.75rem;

      &.primary {
        background: var(--primary-bg);
      }
      &.success {
        background: var(--success-bg);
      }
      &.danger {
        background: var(--danger-bg);
      }
      &.warning {
        background: var(--warning-bg);
      }
    }

    .stat-card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-800);
    }

    .stat-card-label {
      font-size: 0.8125rem;
      color: var(--gray-500);
      margin-top: 0.25rem;
    }

    .stat-card-detail {
      font-size: 0.75rem;
      color: var(--gray-400);
      margin-top: 0.5rem;
    }

    // Tabs
    .content-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 0;
    }

    .tab-btn {
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;

      &:hover {
        color: var(--gray-800);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    // Card
    .card {
      background: var(--white);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);
      overflow: hidden;
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .filter-group {
      display: flex;
      gap: 0.5rem;

      .form-control {
        min-width: 180px;
      }
    }

    // Table
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.875rem 1rem;
      text-align: left;
    }

    th {
      background: var(--gray-50);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gray-600);
    }

    td {
      border-bottom: 1px solid var(--gray-100);
      font-size: 0.875rem;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .aula-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    // Status Badges
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-presente {
      background: var(--success-bg);
      color: #065f46;
    }

    .status-falta {
      background: var(--danger-bg);
      color: #991b1b;
    }

    .status-cancelada {
      background: var(--gray-100);
      color: var(--gray-600);
    }

    .dever-feito, .prep-feito {
      background: var(--success-bg);
      color: #065f46;
    }

    .dever-nao_feito, .prep-nao_feito {
      background: var(--danger-bg);
      color: #991b1b;
    }

    .dever-nao_aplica, .prep-nao_aplica {
      background: var(--gray-100);
      color: var(--gray-500);
    }

    .observacao-text {
      font-size: 0.8125rem;
      color: var(--gray-600);
      max-width: 200px;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // Empty State
    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    // Notas Grid
    .notas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      padding: 1.25rem;
    }

    .nota-card {
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
      padding: 1rem;
      border: 1px solid var(--gray-100);
    }

    .nota-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .nota-data {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .nota-valor {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius-sm);

      &.nota-alta {
        background: var(--success-bg);
        color: #065f46;
      }

      &.nota-media {
        background: var(--warning-bg);
        color: #92400e;
      }

      &.nota-baixa {
        background: var(--danger-bg);
        color: #991b1b;
      }
    }

    .nota-aula {
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 0.75rem;
    }

    .nota-comentario {
      background: var(--white);
      padding: 0.75rem;
      border-radius: var(--border-radius-sm);
      border-left: 3px solid var(--primary);

      .comentario-label {
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--gray-500);
        display: block;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-700);
      }
    }
  `]
})
export class MeuDesempenhoComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  loading = signal(true);
  presencas = signal<Presenca[]>([]);
  desempenhos = signal<Desempenho[]>([]);
  turmas = signal<Turma[]>([]);
  aluno = signal<Aluno | null>(null);

  activeTab: 'presencas' | 'notas' = 'presencas';
  filtroTurma = 0;

  presencasFiltradas = signal<Presenca[]>([]);

  totalPresencas = computed(() =>
    this.presencas().filter(p => p.status === 'presente').length
  );

  totalFaltas = computed(() =>
    this.presencas().filter(p => p.status === 'falta').length
  );

  totalAulas = computed(() =>
    this.presencas().filter(p => p.status !== 'cancelada').length
  );

  taxaPresenca = computed(() => {
    const total = this.totalAulas();
    if (total === 0) return 0;
    return Math.round((this.totalPresencas() / total) * 100);
  });

  mediaNotas = computed(() => {
    const notas = this.desempenhos();
    if (notas.length === 0) return 0;
    const soma = notas.reduce((acc, d) => acc + d.nota, 0);
    return soma / notas.length;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    let pendingRequests = 4;

    const checkComplete = () => {
      pendingRequests--;
      if (pendingRequests <= 0) {
        this.loading.set(false);
      }
    };

    // Carregar dados do aluno
    this.apiService.getCurrentAluno().subscribe({
      next: (aluno) => {
        this.aluno.set(aluno);
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Carregar turmas usando endpoint /me
    this.apiService.getMinhasTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Carregar presenças usando endpoint /me
    this.apiService.getMinhasPresencas().subscribe({
      next: (presencas) => {
        // Ordenar por data decrescente
        presencas.sort((a, b) => new Date(b.dataAula).getTime() - new Date(a.dataAula).getTime());
        this.presencas.set(presencas);
        this.presencasFiltradas.set(presencas);
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Carregar desempenhos usando endpoint /me
    this.apiService.getMeusDesempenhos().subscribe({
      next: (desempenhos) => {
        // Ordenar por data decrescente
        desempenhos.sort((a, b) => new Date(b.dataAula).getTime() - new Date(a.dataAula).getTime());
        this.desempenhos.set(desempenhos);
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  filtrarPresencas(): void {
    const turmaId = Number(this.filtroTurma);
    if (turmaId === 0) {
      this.presencasFiltradas.set(this.presencas());
    } else {
      // Precisamos buscar as aulas para filtrar por turma
      this.presencasFiltradas.set(this.presencas());
    }
  }

  formatData(data: string): string {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'presente': 'Presente',
      'falta': 'Falta',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  }

  getDeverLabel(status: string): string {
    const labels: Record<string, string> = {
      'feito': 'Feito',
      'nao_feito': 'Não Feito',
      'nao_aplica': 'N/A'
    };
    return labels[status] || status;
  }

  getPrepLabel(status: string): string {
    const labels: Record<string, string> = {
      'feito': 'Feito',
      'nao_feito': 'Não Feito',
      'nao_aplica': 'N/A'
    };
    return labels[status] || status;
  }

  getNotaClass(nota: number): string {
    if (nota >= 8) return 'nota-alta';
    if (nota >= 6) return 'nota-media';
    return 'nota-baixa';
  }
}
