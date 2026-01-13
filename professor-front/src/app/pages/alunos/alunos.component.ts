import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aluno, Turma } from '../../core/models/user.model';

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
                <th>Turma</th>
                <th>Telefone</th>
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
                    <span class="badge badge-primary">{{ aluno.nomeTurma }}</span>
                  </td>
                  <td>{{ formatTelefone(aluno) }}</td>
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

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
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

            <div class="form-group">
              <label class="form-label">Turma</label>
              <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma" required>
                @for (turma of turmas(); track turma.id) {
                  <option [value]="turma.id">{{ turma.nome }}</option>
                }
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">DDD</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="form.telefone.codigoArea" 
                  name="codigoArea"
                  maxlength="2"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="form.telefone.numero" 
                  name="numero"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
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

    .filters {
      padding: 1rem 1.5rem;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--gray-500);

      .empty-icon {
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
      }
    }

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
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
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

  form = {
    nome: '',
    email: '',
    username: '',
    senha: '',
    idTurma: 0,
    telefone: { codigoArea: '', numero: '' }
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
        if (turmas.length > 0) {
          this.form.idTurma = turmas[0].id;
        }
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
        this.alunos().filter(a => a.idTurma === this.filtroTurma)
      );
    }
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  formatTelefone(aluno: Aluno): string {
    if (!aluno.telefone) return '-';
    return `(${aluno.telefone.codigoArea}) ${aluno.telefone.numero}`;
  }

  openModal(): void {
    this.editingAluno.set(null);
    this.form = {
      nome: '',
      email: '',
      username: '',
      senha: '',
      idTurma: this.turmas()[0]?.id || 0,
      telefone: { codigoArea: '', numero: '' }
    };
    this.showModal.set(true);
  }

  editAluno(aluno: Aluno): void {
    this.editingAluno.set(aluno);
    this.form = {
      nome: aluno.nome,
      email: aluno.email,
      username: aluno.username,
      senha: '',
      idTurma: aluno.idTurma,
      telefone: aluno.telefone || { codigoArea: '', numero: '' }
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAluno(): void {
    this.saving.set(true);
    const data = { ...this.form };

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
