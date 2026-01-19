import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aluno, Turma } from '../../core/models/user.model';

type TabView = 'todos' | 'aniversariantes';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🎓 Gerenciar Alunos</h2>
        <p class="text-muted">Cadastre e gerencie seus alunos</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Novo Aluno
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs-container mb-4">
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'todos'"
        (click)="activeTab = 'todos'"
      >
        👥 Todos os Alunos
      </button>
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'aniversariantes'"
        (click)="activeTab = 'aniversariantes'"
      >
        🎂 Aniversariantes da Semana
        @if (aniversariantesSemana().length > 0) {
          <span class="tab-badge">{{ aniversariantesSemana().length }}</span>
        }
      </button>
    </div>

    <!-- Tab: Todos os Alunos -->
    @if (activeTab === 'todos') {
      <!-- Filtro por Turma -->
      <div class="filters card mb-4">
        <div class="flex items-center gap-4">
          <label class="form-label mb-0">Filtrar por turma:</label>
          <select class="form-control" style="width: auto;" [(ngModel)]="filtroTurma" (change)="filterAlunos()">
            <option [value]="0">Todas as turmas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando alunos...</p>
        </div>
      } @else if (alunosFiltrados().length === 0) {
        <div class="card">
          <div class="empty-state">
            <span class="empty-icon">🎓</span>
            <h3>Nenhum aluno encontrado</h3>
            <p>Cadastre seu primeiro aluno</p>
            <button class="btn btn-primary mt-4" (click)="openModal()">
              Cadastrar Aluno
            </button>
          </div>
        </div>
      } @else {
        <div class="card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Email</th>
                  <th>Turmas</th>
                  <th>Telefone</th>
                  <th>Nascimento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (aluno of alunosFiltrados(); track aluno.id) {
                  <tr>
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="avatar">{{ getInitials(aluno.nome) }}</div>
                        <div>
                          <div class="font-semibold">{{ aluno.nome }}</div>
                          <div class="text-muted" style="font-size: 0.75rem;">{{ aluno.username }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ aluno.email }}</td>
                    <td>
                      <div class="turmas-badges">
                        @if (aluno.turmas && aluno.turmas.length > 0) {
                          @for (turma of aluno.turmas; track turma.id) {
                            <span class="badge badge-primary">{{ turma.nome }}</span>
                          }
                        } @else if (aluno.nomeTurma) {
                          <span class="badge badge-primary">{{ aluno.nomeTurma }}</span>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </div>
                    </td>
                    <td>{{ formatTelefone(aluno.telefone) }}</td>
                    <td>{{ formatDataNascimento(aluno.dataNascimento) }}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" (click)="editAluno(aluno)">
                          Editar
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="deleteAluno(aluno.id)">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }

    <!-- Tab: Aniversariantes da Semana -->
    @if (activeTab === 'aniversariantes') {
      <div class="card">
        @if (aniversariantesSemana().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🎂</span>
            <h3>Nenhum aniversariante esta semana</h3>
            <p class="text-muted">Os aniversariantes dos próximos 7 dias aparecerão aqui</p>
          </div>
        } @else {
          <div class="aniversariantes-grid">
            @for (aluno of aniversariantesSemana(); track aluno.id) {
              <div class="aniversariante-card">
                <div class="aniversariante-avatar">
                  <div class="avatar avatar-lg">{{ getInitials(aluno.nome) }}</div>
                  <span class="birthday-icon">🎂</span>
                </div>
                <div class="aniversariante-info">
                  <h4>{{ aluno.nome }}</h4>
                  <p class="aniversariante-data">
                    {{ formatDataAniversario(aluno.dataNascimento) }}
                    <span class="dias-restantes">{{ getDiasRestantes(aluno.dataNascimento) }}</span>
                  </p>
                  <div class="aniversariante-turmas">
                    @if (aluno.turmas && aluno.turmas.length > 0) {
                      @for (turma of aluno.turmas; track turma.id) {
                        <span class="badge badge-primary badge-sm">{{ turma.nome }}</span>
                      }
                    } @else if (aluno.nomeTurma) {
                      <span class="badge badge-primary badge-sm">{{ aluno.nomeTurma }}</span>
                    }
                  </div>
                </div>
                <div class="aniversariante-actions">
                  @if (aluno.telefone) {
                    <a [href]="'https://wa.me/55' + aluno.telefone.codigoArea + aluno.telefone.numero" 
                       target="_blank" class="btn btn-success btn-sm">
                      📱 WhatsApp
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingAluno() ? 'Editar Aluno' : 'Novo Aluno' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveAluno()">
            <div class="form-group">
              <label class="form-label">Nome Completo</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.nome" 
                name="nome"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  [(ngModel)]="form.email" 
                  name="email"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Data de Nascimento</label>
                <input 
                  type="date" 
                  class="form-control" 
                  [(ngModel)]="form.dataNascimento" 
                  name="dataNascimento"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Usuário</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="form.username" 
                  name="username"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Senha</label>
                <input 
                  type="password" 
                  class="form-control" 
                  [(ngModel)]="form.senha" 
                  name="senha"
                  [required]="!editingAluno()"
                  placeholder="{{ editingAluno() ? 'Deixe vazio para manter' : '' }}"
                />
              </div>
            </div>

            <!-- Seleção de Múltiplas Turmas -->
            <div class="form-group">
              <label class="form-label">Turmas</label>
              <p class="text-muted text-sm mb-2">O aluno pode participar de mais de uma turma</p>
              <div class="turmas-selection">
                @for (turma of turmas(); track turma.id) {
                  <label class="turma-checkbox">
                    <input 
                      type="checkbox" 
                      [checked]="isTurmaSelected(turma.id)"
                      (change)="toggleTurma(turma.id)"
                    />
                    <div class="turma-checkbox-content">
                      <span class="turma-name">{{ turma.nome }}</span>
                      <span class="turma-info-small">{{ turma.idioma.label }} • {{ turma.nivelTurma?.codigo || 'Sem nível' }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Telefones -->
            <div class="telefones-section">
              <h4 class="section-title">📱 Telefones</h4>
              
              <!-- Telefone do Aluno -->
              <div class="form-group">
                <label class="form-label">Celular do Aluno</label>
                <div class="telefone-row">
                  <input 
                    type="text" 
                    class="form-control ddd-input" 
                    [(ngModel)]="form.telefone.codigoArea" 
                    name="codigoArea"
                    maxlength="2"
                    placeholder="DDD"
                  />
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="form.telefone.numero" 
                    name="numero"
                    placeholder="Número"
                  />
                </div>
              </div>

              <!-- Telefone do Responsável -->
              <div class="form-group">
                <label class="form-label">Celular do Responsável</label>
                <div class="telefone-row">
                  <input 
                    type="text" 
                    class="form-control ddd-input" 
                    [(ngModel)]="form.telefoneResponsavel.codigoArea" 
                    name="codigoAreaResp"
                    maxlength="2"
                    placeholder="DDD"
                  />
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="form.telefoneResponsavel.numero" 
                    name="numeroResp"
                    placeholder="Número"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || turmasSelecionadas.length === 0">
                {{ editingAluno() ? 'Salvar' : 'Cadastrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .tabs-container {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--gray-200);
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
      margin-bottom: -2px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        color: var(--gray-800);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    .tab-badge {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
    }

    .filters { padding: 1rem 1.5rem; }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--gray-500);

      .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    }

    .turmas-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    // Aniversariantes
    .aniversariantes-grid {
      display: flex;
      flex-direction: column;
    }

    .aniversariante-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      &:last-child { border-bottom: none; }

      &:hover {
        background: var(--gray-50);
      }
    }

    .aniversariante-avatar {
      position: relative;

      .avatar-lg {
        width: 56px;
        height: 56px;
        font-size: 1.25rem;
      }

      .birthday-icon {
        position: absolute;
        bottom: -4px;
        right: -4px;
        font-size: 1.25rem;
      }
    }

    .aniversariante-info {
      flex: 1;

      h4 { margin-bottom: 0.25rem; }
    }

    .aniversariante-data {
      font-size: 0.875rem;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dias-restantes {
      background: var(--primary-bg);
      color: var(--primary);
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .aniversariante-turmas {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.25rem;
    }

    .badge-sm { font-size: 0.7rem; padding: 0.125rem 0.375rem; }

    // Modal
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--white);
      border-radius: var(--border-radius);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-lg { max-width: 600px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-body { padding: 1.5rem; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .text-sm { font-size: 0.8125rem; }

    // Telefones Section
    .telefones-section {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-top: 1rem;
    }

    .section-title {
      font-size: 0.9375rem;
      margin-bottom: 1rem;
      color: var(--gray-700);
    }

    .telefone-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 0.5rem;
    }

    .ddd-input { text-align: center; }

    // Turmas Selection
    .turmas-selection {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      padding: 0.5rem;
    }

    .turma-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-50);
        border-color: var(--primary-light);
      }

      &:has(input:checked) {
        background: var(--primary-bg);
        border-color: var(--primary);
      }

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--primary);
      }
    }

    .turma-checkbox-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .turma-name {
      font-weight: 500;
      color: var(--gray-800);
    }

    .turma-info-small {
      font-size: 0.75rem;
      color: var(--gray-500);
    }
  `]
})
export class AlunosComponent implements OnInit {
  private apiService = inject(ApiService);

  alunos = signal<Aluno[]>([]);
  alunosFiltrados = signal<Aluno[]>([]);
  turmas = signal<Turma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingAluno = signal<Aluno | null>(null);
  filtroTurma = 0;
  activeTab: TabView = 'todos';

  turmasSelecionadas: number[] = [];

  form = {
    nome: '',
    email: '',
    username: '',
    senha: '',
    dataNascimento: '',
    telefone: { codigoArea: '', numero: '' },
    telefoneResponsavel: { codigoArea: '', numero: '' }
  };

  aniversariantesSemana = computed(() => {
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(hoje.getDate() + 7);

    return this.alunos()
      .filter(a => {
        if (!a.dataNascimento) return false;
        
        const nascimento = new Date(a.dataNascimento + 'T00:00:00');
        const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        
        // Se já passou, verificar ano que vem
        if (aniversarioEsteAno < hoje) {
          aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
        }
        
        return aniversarioEsteAno >= hoje && aniversarioEsteAno <= seteDias;
      })
      .sort((a, b) => {
        const dateA = this.getProximoAniversario(a.dataNascimento!);
        const dateB = this.getProximoAniversario(b.dataNascimento!);
        return dateA.getTime() - dateB.getTime();
      });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
      }
    });

    this.loadAlunos();
  }

  loadAlunos(): void {
    this.loading.set(true);
    this.apiService.getAlunos().subscribe({
      next: (alunos) => {
        this.alunos.set(alunos);
        this.alunosFiltrados.set(alunos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterAlunos(): void {
    if (this.filtroTurma === 0) {
      this.alunosFiltrados.set(this.alunos());
    } else {
      this.alunosFiltrados.set(
        this.alunos().filter(a => {
          if (a.turmas && a.turmas.length > 0) {
            return a.turmas.some(t => t.id === this.filtroTurma);
          }
          return a.idTurma === this.filtroTurma;
        })
      );
    }
  }

  isTurmaSelected(turmaId: number): boolean {
    return this.turmasSelecionadas.includes(turmaId);
  }

  toggleTurma(turmaId: number): void {
    const index = this.turmasSelecionadas.indexOf(turmaId);
    if (index > -1) {
      this.turmasSelecionadas.splice(index, 1);
    } else {
      this.turmasSelecionadas.push(turmaId);
    }
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  formatTelefone(telefone?: { codigoArea: string; numero: string }): string {
    if (!telefone || !telefone.numero) return '-';
    return `(${telefone.codigoArea}) ${telefone.numero}`;
  }

  formatDataNascimento(data?: string): string {
    if (!data) return '-';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  formatDataAniversario(data?: string): string {
    if (!data) return '-';
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  }

  getProximoAniversario(dataNascimento: string): Date {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento + 'T00:00:00');
    const aniversario = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
    
    if (aniversario < hoje) {
      aniversario.setFullYear(hoje.getFullYear() + 1);
    }
    
    return aniversario;
  }

  getDiasRestantes(dataNascimento?: string): string {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const aniversario = this.getProximoAniversario(dataNascimento);
    
    const diffTime = aniversario.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '🎉 Hoje!';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays} dias`;
  }

  openModal(): void {
    this.editingAluno.set(null);
    this.form = {
      nome: '',
      email: '',
      username: '',
      senha: '',
      dataNascimento: '',
      telefone: { codigoArea: '', numero: '' },
      telefoneResponsavel: { codigoArea: '', numero: '' }
    };
    this.turmasSelecionadas = this.turmas().length > 0 ? [this.turmas()[0].id] : [];
    this.showModal.set(true);
  }

  editAluno(aluno: Aluno): void {
    this.editingAluno.set(aluno);
    this.form = {
      nome: aluno.nome,
      email: aluno.email,
      username: aluno.username,
      senha: '',
      dataNascimento: aluno.dataNascimento || '',
      telefone: aluno.telefone || { codigoArea: '', numero: '' },
      telefoneResponsavel: aluno.telefoneResponsavel || { codigoArea: '', numero: '' }
    };
    
    if (aluno.turmas && aluno.turmas.length > 0) {
      this.turmasSelecionadas = aluno.turmas.map(t => t.id);
    } else if (aluno.idTurma) {
      this.turmasSelecionadas = [aluno.idTurma];
    } else {
      this.turmasSelecionadas = [];
    }
    
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAluno(): void {
    this.saving.set(true);
    
    const data: any = { ...this.form };
    
    if (this.turmasSelecionadas.length === 1) {
      data.idTurma = this.turmasSelecionadas[0];
    }
    data.idsTurmas = this.turmasSelecionadas;

    if (this.editingAluno()) {
      this.apiService.updateAluno(this.editingAluno()!.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAlunos();
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.apiService.createAluno(data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAlunos();
        },
        error: () => this.saving.set(false)
      });
    }
  }

  deleteAluno(id: number): void {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      this.apiService.deleteAluno(id).subscribe({
        next: () => this.loadAlunos()
      });
    }
  }
}
