import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aula, Turma } from '../../core/models/user.model';

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📅 Agenda de Aulas</h2>
        <p class="text-muted">Gerencie o calendário de aulas</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Aula
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters card mb-4">
      <div class="flex items-center gap-4">
        <div class="form-group mb-0">
          <label class="form-label">Data:</label>
          <input type="date" class="form-control" [(ngModel)]="filtroData" (change)="loadAulas()" />
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Turma:</label>
          <select class="form-control" [(ngModel)]="filtroTurma" (change)="filterAulas()">
            <option [value]="0">Todas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
      </div>
    } @else if (aulasFiltradas().length === 0) {
      <div class="card empty-state">
        <span class="empty-icon">📭</span>
        <h3>Nenhuma aula encontrada</h3>
        <p>Agende sua primeira aula</p>
        <button class="btn btn-primary mt-4" (click)="openModal()">Agendar Aula</button>
      </div>
    } @else {
      <div class="aulas-list">
        @for (aula of aulasFiltradas(); track aula.id) {
          <div class="card aula-card">
            <div class="aula-time">
              <span class="time">{{ aula.horaInicio }}</span>
              <span class="duration" *ngIf="aula.duracaoMinutos">{{ aula.duracaoMinutos }}min</span>
            </div>
            <div class="aula-content">
              <h4>{{ aula.topico }}</h4>
              <p class="text-muted">{{ aula.descricao }}</p>
              <div class="aula-meta">
                <span class="badge badge-primary">{{ aula.nomeTurma }}</span>
                <span class="text-muted">{{ formatDate(aula.data) }}</span>
              </div>
            </div>
            <div class="aula-actions">
              <button class="btn btn-outline btn-sm" (click)="editAula(aula)">Editar</button>
              <button class="btn btn-danger btn-sm" (click)="deleteAula(aula.id)">Excluir</button>
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
            <h3>{{ editingAula() ? 'Editar Aula' : 'Nova Aula' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveAula()">
            <div class="form-group">
              <label class="form-label">Turma</label>
              <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma" required>
                @for (turma of turmas(); track turma.id) {
                  <option [value]="turma.id">{{ turma.nome }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tópico</label>
              <input type="text" class="form-control" [(ngModel)]="form.topico" name="topico" required />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Data</label>
                <input type="date" class="form-control" [(ngModel)]="form.data" name="data" required />
              </div>
              <div class="form-group">
                <label class="form-label">Duração (min)</label>
                <input type="number" class="form-control" [(ngModel)]="form.duracaoMinutos" name="duracaoMinutos" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Hora Início</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaInicio" name="horaInicio" required />
              </div>
              <div class="form-group">
                <label class="form-label">Hora Fim</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaFim" name="horaFim" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingAula() ? 'Salvar' : 'Agendar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .filters { padding: 1rem 1.5rem; }
    .loading-state, .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }

    .aulas-list { display: flex; flex-direction: column; gap: 1rem; }

    .aula-card {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      transition: transform 0.2s;
      &:hover { transform: translateX(4px); }
    }

    .aula-time {
      min-width: 80px;
      text-align: center;
      padding: 0.75rem;
      background: var(--primary-bg);
      border-radius: var(--border-radius-sm);
      .time { display: block; font-size: 1.25rem; font-weight: 700; color: var(--primary); }
      .duration { font-size: 0.75rem; color: var(--gray-500); }
    }

    .aula-content { flex: 1; h4 { margin-bottom: 0.25rem; } }
    .aula-meta { display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem; }
    .aula-actions { display: flex; gap: 0.5rem; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  `]
})
export class AulasComponent implements OnInit {
  private apiService = inject(ApiService);

  aulas = signal<Aula[]>([]);
  aulasFiltradas = signal<Aula[]>([]);
  turmas = signal<Turma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingAula = signal<Aula | null>(null);

  filtroData = new Date().toISOString().split('T')[0];
  filtroTurma = 0;

  form = { idTurma: 0, topico: '', descricao: '', data: '', horaInicio: '', horaFim: '', duracaoMinutos: 60 };

  ngOnInit(): void {
    this.apiService.getTurmas().subscribe(t => {
      this.turmas.set(t);
      if (t.length) this.form.idTurma = t[0].id;
    });
    this.loadAulas();
  }

  loadAulas(): void {
    this.loading.set(true);
    this.apiService.getAulasByData(this.filtroData).subscribe({
      next: aulas => { this.aulas.set(aulas); this.filterAulas(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filterAulas(): void {
    this.aulasFiltradas.set(this.filtroTurma ? this.aulas().filter(a => a.idTurma === this.filtroTurma) : this.aulas());
  }

  formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  openModal(): void {
    this.editingAula.set(null);
    this.form = { idTurma: this.turmas()[0]?.id || 0, topico: '', descricao: '', data: this.filtroData, horaInicio: '08:00', horaFim: '10:00', duracaoMinutos: 120 };
    this.showModal.set(true);
  }

  editAula(aula: Aula): void {
    this.editingAula.set(aula);
    this.form = { idTurma: aula.idTurma, topico: aula.topico, descricao: aula.descricao || '', data: aula.data, horaInicio: aula.horaInicio, horaFim: aula.horaFim || '', duracaoMinutos: aula.duracaoMinutos || 60 };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  saveAula(): void {
    const obs = this.editingAula()
      ? this.apiService.updateAula(this.editingAula()!.id, this.form)
      : this.apiService.createAula(this.form);
    obs.subscribe({ next: () => { this.closeModal(); this.loadAulas(); } });
  }

  deleteAula(id: number): void {
    if (confirm('Excluir esta aula?')) this.apiService.deleteAula(id).subscribe(() => this.loadAulas());
  }
}
