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
        <h2>📖 Aulas</h2>
        <p class="text-muted">Gerencie suas aulas</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Aula
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4 p-3">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="form-group mb-0" style="min-width: 200px;">
          <label class="form-label mb-1">Turma</label>
          <select class="form-control" [(ngModel)]="filtroTurma" (change)="loadAulas()">
            <option [value]="0">Todas as turmas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
        <div class="form-group mb-0" style="min-width: 150px;">
          <label class="form-label mb-1">Data</label>
          <input type="date" class="form-control" [(ngModel)]="filtroData" (change)="loadAulas()" />
        </div>
        <div class="form-group mb-0" style="align-self: flex-end;">
          <button class="btn btn-outline" (click)="limparFiltros()">Limpar filtros</button>
        </div>
      </div>
    </div>

    <div class="card">
      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
        </div>
      } @else if (aulasFiltradas().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📖</span>
          <h3>Nenhuma aula encontrada</h3>
          <p class="text-muted">Crie sua primeira aula clicando no botão acima</p>
        </div>
      } @else {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Turma</th>
                <th>Tópico</th>
                <th>Duração</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (aula of aulasFiltradas(); track aula.id) {
                <tr>
                  <td>{{ formatDate(aula.data) }}</td>
                  <td>{{ aula.horaInicio }} - {{ aula.horaFim || '--:--' }}</td>
                  <td>
                    <span class="badge badge-primary">{{ aula.nomeTurma }}</span>
                  </td>
                  <td class="font-medium">{{ aula.topico }}</td>
                  <td>{{ aula.duracaoMinutos }} min</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-sm btn-outline" (click)="editAula(aula)">✏️</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteAula(aula.id)">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal Nova/Editar Aula -->
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
              <input type="text" class="form-control" [(ngModel)]="form.topico" name="topico" 
                placeholder="Ex: Present Simple, Vocabulary" required />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"
                placeholder="Descrição da aula (opcional)"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" class="form-control" [(ngModel)]="form.data" name="data" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Hora Início</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaInicio" name="horaInicio" 
                  (change)="calculateDuration()" required />
              </div>
              <div class="form-group">
                <label class="form-label">Hora Fim</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaFim" name="horaFim" 
                  (change)="calculateDuration()" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Duração (minutos) <span class="text-muted text-sm">- calculado automaticamente</span></label>
              <input type="number" class="form-control readonly-field" [(ngModel)]="form.duracaoMinutos" 
                name="duracaoMinutos" readonly />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingAula() ? 'Salvar' : 'Criar Aula' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .loading-state, .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .readonly-field { background: var(--gray-50); cursor: not-allowed; }
  `]
})
export class AulasComponent implements OnInit {
  private apiService = inject(ApiService);

  turmas = signal<Turma[]>([]);
  aulas = signal<Aula[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingAula = signal<Aula | null>(null);

  filtroTurma = 0;
  filtroData = '';

  form = { idTurma: 0, topico: '', descricao: '', data: '', horaInicio: '08:00', horaFim: '10:00', duracaoMinutos: 120 };

  aulasFiltradas = () => {
    let result = this.aulas();
    
    if (this.filtroTurma > 0) {
      result = result.filter(a => a.idTurma === this.filtroTurma);
    }
    
    if (this.filtroData) {
      result = result.filter(a => a.data === this.filtroData);
    }
    
    return result.sort((a, b) => {
      const dateCompare = b.data.localeCompare(a.data);
      if (dateCompare !== 0) return dateCompare;
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  };

  ngOnInit(): void {
    this.apiService.getTurmas().subscribe(t => {
      this.turmas.set(t);
      if (t.length) this.form.idTurma = t[0].id;
    });
    this.loadAulas();
  }

  loadAulas(): void {
    this.loading.set(true);
    this.apiService.getAulas().subscribe({
      next: aulas => { this.aulas.set(aulas); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  limparFiltros(): void {
    this.filtroTurma = 0;
    this.filtroData = '';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short'
    });
  }

  calculateDuration(): void {
    if (this.form.horaInicio && this.form.horaFim) {
      const [h1, m1] = this.form.horaInicio.split(':').map(Number);
      const [h2, m2] = this.form.horaFim.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      this.form.duracaoMinutos = end > start ? end - start : 0;
    }
  }

  openModal(): void {
    this.editingAula.set(null);
    this.form = {
      idTurma: this.turmas()[0]?.id || 0,
      topico: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFim: '10:00',
      duracaoMinutos: 120
    };
    this.showModal.set(true);
  }

  editAula(aula: Aula): void {
    this.editingAula.set(aula);
    this.form = {
      idTurma: aula.idTurma,
      topico: aula.topico,
      descricao: aula.descricao || '',
      data: aula.data,
      horaInicio: aula.horaInicio,
      horaFim: aula.horaFim || '',
      duracaoMinutos: aula.duracaoMinutos || 60
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAula(): void {
    const obs = this.editingAula()
      ? this.apiService.updateAula(this.editingAula()!.id, this.form)
      : this.apiService.createAula(this.form);
    
    obs.subscribe({
      next: () => {
        this.closeModal();
        this.loadAulas();
      }
    });
  }

  deleteAula(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      this.apiService.deleteAula(id).subscribe(() => this.loadAulas());
    }
  }
}
