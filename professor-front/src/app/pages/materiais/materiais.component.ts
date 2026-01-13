import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MaterialExtraAula, Turma } from '../../core/models/user.model';

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📚 Materiais Extra</h2>
        <p class="text-muted">Acesse conteúdos complementares para estudo</p>
      </div>
      @if (authService.isProfessor()) {
        <button class="btn btn-primary" (click)="openModal()">+ Novo Material</button>
      }
    </div>

    <!-- Tipos -->
    <div class="tipos mb-4">
      @for (tipo of tipos; track tipo.id) {
        <button 
          [class]="'tipo-btn ' + (tipoAtivo === tipo.id ? 'active' : '')"
          (click)="filterByTipo(tipo.id)"
        >
          {{ tipo.icon }} {{ tipo.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading-state"><span class="spinner"></span></div>
    } @else if (materiaisFiltrados().length === 0) {
      <div class="card empty-state">
        <span class="empty-icon">📭</span>
        <h3>Nenhum material encontrado</h3>
      </div>
    } @else {
      <div class="materiais-grid">
        @for (material of materiaisFiltrados(); track material.id) {
          <div class="card material-card">
            <div class="material-icon">{{ getTipoIcon(material.tipoConteudo.id) }}</div>
            <div class="material-content">
              <h4>{{ material.titulo }}</h4>
              <p class="text-muted">{{ material.descricao }}</p>
              <div class="material-meta">
                <span class="badge badge-info">{{ material.tipoConteudo.label }}</span>
                <span class="badge badge-primary">{{ material.nomeTurma }}</span>
              </div>
            </div>
            <div class="material-actions">
              @if (material.urlArquivo) {
                <a [href]="material.urlArquivo" target="_blank" class="btn btn-primary btn-sm">
                  🔗 Acessar
                </a>
              }
              @if (material.nomeArquivo) {
                <a [href]="getDownloadUrl(material.nomeArquivo)" class="btn btn-outline btn-sm">
                  ⬇️ Baixar
                </a>
              }
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
            <h3>Novo Material</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-body" (ngSubmit)="saveMaterial()">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input type="text" class="form-control" [(ngModel)]="form.titulo" name="titulo" required />
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo</label>
                <select class="form-control" [(ngModel)]="form.idTipoConteudo" name="idTipoConteudo">
                  @for (tipo of tipos.slice(1); track tipo.id) {
                    <option [value]="tipo.id">{{ tipo.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Turma</label>
                <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma">
                  @for (turma of turmas(); track turma.id) {
                    <option [value]="turma.id">{{ turma.nome }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">URL (link externo)</label>
              <input type="url" class="form-control" [(ngModel)]="form.urlArquivo" name="urlArquivo" 
                placeholder="https://..." />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    
    .tipos { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .tipo-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-200);
      background: var(--white);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: var(--primary); }
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
    }

    .loading-state, .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }

    .materiais-grid { display: flex; flex-direction: column; gap: 1rem; }

    .material-card {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    .material-icon {
      width: 56px;
      height: 56px;
      background: var(--primary-bg);
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .material-content { flex: 1; h4 { margin-bottom: 0.25rem; } }
    .material-meta { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .material-actions { display: flex; gap: 0.5rem; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  `]
})
export class MateriaisComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  materiais = signal<MaterialExtraAula[]>([]);
  materiaisFiltrados = signal<MaterialExtraAula[]>([]);
  turmas = signal<Turma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  tipoAtivo = 0;

  tipos = [
    { id: 0, label: 'Todos', icon: '📚' },
    { id: 1, label: 'Leitura', icon: '📖' },
    { id: 2, label: 'Vídeo', icon: '🎬' },
    { id: 3, label: 'Áudio', icon: '🎧' },
    { id: 4, label: 'Link', icon: '🔗' },
    { id: 5, label: 'PDF', icon: '📄' }
  ];

  form = { titulo: '', descricao: '', idTipoConteudo: 1, urlArquivo: '', idTurma: 0 };

  ngOnInit(): void {
    this.loadMateriais();
    this.apiService.getTurmas().subscribe(t => { this.turmas.set(t); if (t.length) this.form.idTurma = t[0].id; });
  }

  loadMateriais(): void {
    this.loading.set(true);
    this.apiService.getMateriais().subscribe({
      next: m => { this.materiais.set(m); this.materiaisFiltrados.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filterByTipo(id: number): void {
    this.tipoAtivo = id;
    this.materiaisFiltrados.set(id === 0 ? this.materiais() : this.materiais().filter(m => m.tipoConteudo.id === id));
  }

  getTipoIcon(id: number): string {
    return this.tipos.find(t => t.id === id)?.icon || '📄';
  }

  getDownloadUrl(nomeArquivo: string): string {
    return `http://localhost:8080/materiais/download/${nomeArquivo}`;
  }

  openModal(): void { this.form = { titulo: '', descricao: '', idTipoConteudo: 1, urlArquivo: '', idTurma: this.turmas()[0]?.id || 0 }; this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); }

  saveMaterial(): void {
    this.apiService.createMaterial(this.form).subscribe(() => { this.closeModal(); this.loadMateriais(); });
  }
}
