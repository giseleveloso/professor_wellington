import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Turma } from '../../core/models/user.model';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>👥 Gerenciar Turmas</h2>
        <p class="text-muted">Crie e gerencie suas turmas de idiomas</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Turma
      </button>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
        <p>Carregando turmas...</p>
      </div>
    } @else if (turmas().length === 0) {
      <div class="card">
        <div class="empty-state">
          <span class="empty-icon">📚</span>
          <h3>Nenhuma turma cadastrada</h3>
          <p>Comece criando sua primeira turma</p>
          <button class="btn btn-primary mt-4" (click)="openModal()">
            Criar Turma
          </button>
        </div>
      </div>
    } @else {
      <div class="turmas-grid">
        @for (turma of turmas(); track turma.id) {
          <div class="card turma-card">
            <div class="turma-header">
              <span class="turma-flag">{{ getIdiomaFlag(turma.idioma.id) }}</span>
              <div class="turma-actions">
                <button class="btn btn-icon btn-secondary" (click)="editTurma(turma)">✏️</button>
                <button class="btn btn-icon btn-secondary" (click)="deleteTurma(turma.id)">🗑️</button>
              </div>
            </div>
            
            <h3 class="turma-nome">{{ turma.nome }}</h3>
            
            <div class="turma-badges">
              <span class="badge badge-primary">{{ turma.idioma.label }}</span>
              <span class="badge badge-info">{{ turma.nivel.label }}</span>
            </div>
            
            <div class="turma-info">
              <div class="info-item">
                <span class="info-icon">🕐</span>
                <span>{{ turma.horario }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span>{{ turma.diasSemana }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🎓</span>
                <span>{{ turma.quantidadeAlunos }} alunos</span>
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingTurma() ? 'Editar Turma' : 'Nova Turma' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveTurma()">
            <div class="form-group">
              <label class="form-label">Nome da Turma</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.nome" 
                name="nome"
                placeholder="Ex: Inglês Básico - Manhã"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Idioma</label>
                <select class="form-control" [(ngModel)]="form.idIdioma" name="idIdioma" required>
                  <option [value]="1">Inglês</option>
                  <option [value]="2">Espanhol</option>
                  <option [value]="3">Francês</option>
                  <option [value]="4">Alemão</option>
                  <option [value]="5">Italiano</option>
                  <option [value]="6">Japonês</option>
                  <option [value]="7">Chinês</option>
                  <option [value]="8">Coreano</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Nível</label>
                <select class="form-control" [(ngModel)]="form.idNivel" name="idNivel" required>
                  <option [value]="1">Iniciante</option>
                  <option [value]="2">Básico</option>
                  <option [value]="3">Intermediário</option>
                  <option [value]="4">Avançado</option>
                  <option [value]="5">Fluente</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Horário</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.horario" 
                name="horario"
                placeholder="Ex: 08:00 - 10:00"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Dias da Semana</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.diasSemana" 
                name="diasSemana"
                placeholder="Ex: Segunda, Quarta, Sexta"
              />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                {{ editingTurma() ? 'Salvar' : 'Criar Turma' }}
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

      h2 {
        margin-bottom: 0.25rem;
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      color: var(--gray-500);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon {
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
      }

      h3 {
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
      }
    }

    .turmas-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .turma-card {
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .turma-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .turma-flag {
      font-size: 2.5rem;
    }

    .turma-actions {
      display: flex;
      gap: 0.5rem;
    }

    .turma-nome {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }

    .turma-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .turma-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .info-icon {
      width: 20px;
      text-align: center;
    }

    // Modal
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    .modal {
      background: var(--white);
      border-radius: var(--border-radius);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      h3 {
        margin: 0;
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

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

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TurmasComponent implements OnInit {
  private apiService = inject(ApiService);

  turmas = signal<Turma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingTurma = signal<Turma | null>(null);

  form = {
    nome: '',
    idIdioma: 1,
    idNivel: 1,
    horario: '',
    diasSemana: '',
    idProfessor: 1 // TODO: Obter do usuário logado
  };

  ngOnInit(): void {
    this.loadTurmas();
  }

  loadTurmas(): void {
    this.loading.set(true);
    this.apiService.getTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getIdiomaFlag(idIdioma: number): string {
    const flags: { [key: number]: string } = {
      1: '🇺🇸', 2: '🇪🇸', 3: '🇫🇷', 4: '🇩🇪', 5: '🇮🇹',
      6: '🇯🇵', 7: '🇨🇳', 8: '🇰🇷', 9: '🇧🇷', 10: '🌍'
    };
    return flags[idIdioma] || '🌍';
  }

  openModal(): void {
    this.editingTurma.set(null);
    this.form = {
      nome: '',
      idIdioma: 1,
      idNivel: 1,
      horario: '',
      diasSemana: '',
      idProfessor: 1
    };
    this.showModal.set(true);
  }

  editTurma(turma: Turma): void {
    this.editingTurma.set(turma);
    this.form = {
      nome: turma.nome,
      idIdioma: turma.idioma.id,
      idNivel: turma.nivel.id,
      horario: turma.horario,
      diasSemana: turma.diasSemana,
      idProfessor: turma.idProfessor
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveTurma(): void {
    this.saving.set(true);

    const data = { ...this.form };

    if (this.editingTurma()) {
      this.apiService.updateTurma(this.editingTurma()!.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTurmas();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.apiService.createTurma(data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTurmas();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    }
  }

  deleteTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.apiService.deleteTurma(id).subscribe({
        next: () => this.loadTurmas(),
        error: () => {}
      });
    }
  }
}
