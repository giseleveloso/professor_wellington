import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NivelTurma } from '../../core/models/user.model';

@Component({
  selector: 'app-niveis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📊 Níveis de Turma</h2>
        <p class="text-muted">Personalize os níveis de proficiência</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Novo Nível
      </button>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
        <p>Carregando níveis...</p>
      </div>
    } @else {
      <div class="card">
        <div class="niveis-list">
          @for (nivel of niveis(); track nivel.id; let i = $index) {
            <div class="nivel-item" [class.dragging]="dragIndex === i" 
              draggable="true" 
              (dragstart)="onDragStart(i)"
              (dragover)="onDragOver($event, i)"
              (dragend)="onDragEnd()">
              <div class="nivel-drag-handle">⋮⋮</div>
              <div class="nivel-ordem">{{ i + 1 }}</div>
              <div class="nivel-info">
                <span class="nivel-codigo">{{ nivel.codigo }}</span>
                <span class="nivel-descricao">{{ nivel.descricao }}</span>
              </div>
              <div class="nivel-actions">
                <button class="btn btn-icon btn-sm" (click)="editNivel(nivel)">✏️</button>
                <button class="btn btn-icon btn-sm" (click)="deleteNivel(nivel.id)">🗑️</button>
              </div>
            </div>
          }

          @if (niveis().length === 0) {
            <div class="empty-state-sm">
              <p>Nenhum nível cadastrado</p>
              <button class="btn btn-primary mt-2" (click)="carregarNiveisPadrao()">
                Carregar níveis padrão (CEFR)
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Sugestão de níveis padrão -->
      @if (niveis().length > 0) {
        <div class="card mt-4 p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium mb-1">💡 Dica</p>
              <p class="text-muted text-sm">Arraste os itens para reordenar os níveis</p>
            </div>
            <button class="btn btn-outline btn-sm" (click)="carregarNiveisPadrao()">
              🔄 Restaurar padrão CEFR
            </button>
          </div>
        </div>
      }
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingNivel() ? 'Editar Nível' : 'Novo Nível' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveNivel()">
            <div class="form-group">
              <label class="form-label">Código</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.codigo" 
                name="codigo"
                placeholder="Ex: A1, B2, C1"
                required
                maxlength="10"
              />
              <p class="text-muted text-sm mt-1">Código curto para identificar o nível</p>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.descricao" 
                name="descricao"
                placeholder="Ex: Iniciante, Intermediário"
                required
              />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || !form.codigo">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                {{ editingNivel() ? 'Salvar' : 'Criar Nível' }}
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

      h2 { margin-bottom: 0.25rem; }
    }

    .loading-state, .empty-state-sm {
      text-align: center;
      padding: 3rem;
      color: var(--gray-500);
    }

    .niveis-list {
      display: flex;
      flex-direction: column;
    }

    .nivel-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);
      transition: all 0.2s;
      cursor: grab;

      &:last-child { border-bottom: none; }

      &:hover {
        background: var(--gray-50);
      }

      &.dragging {
        opacity: 0.5;
        background: var(--primary-bg);
      }
    }

    .nivel-drag-handle {
      color: var(--gray-400);
      font-size: 1rem;
      letter-spacing: 2px;
      cursor: grab;

      &:active { cursor: grabbing; }
    }

    .nivel-ordem {
      width: 32px;
      height: 32px;
      background: var(--primary-bg);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .nivel-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nivel-codigo {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--gray-800);
      min-width: 60px;
    }

    .nivel-descricao {
      color: var(--gray-600);
    }

    .nivel-actions {
      display: flex;
      gap: 0.25rem;
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
    }

    .modal {
      background: var(--white);
      border-radius: var(--border-radius);
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      h3 { margin: 0; }
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

    .text-sm { font-size: 0.8125rem; }
  `]
})
export class NiveisComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  niveis = signal<NivelTurma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingNivel = signal<NivelTurma | null>(null);

  dragIndex: number | null = null;

  form = {
    codigo: '',
    descricao: ''
  };

  ngOnInit(): void {
    this.loadNiveis();
  }

  loadNiveis(): void {
    this.loading.set(true);
    const professorId = 1; // TODO: pegar do auth service quando disponível
    
    this.apiService.getNiveisTurma(professorId).subscribe({
      next: niveis => {
        this.niveis.set(niveis);
        this.loading.set(false);
      },
      error: () => {
        this.niveis.set([]);
        this.loading.set(false);
      }
    });
  }

  carregarNiveisPadrao(): void {
    const professorId = 1;
    this.loading.set(true);
    
    this.apiService.criarNiveisTurmaPadrao(professorId).subscribe({
      next: () => {
        this.loadNiveis();
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.editingNivel.set(null);
    this.form = { codigo: '', descricao: '' };
    this.showModal.set(true);
  }

  editNivel(nivel: NivelTurma): void {
    this.editingNivel.set(nivel);
    this.form = {
      codigo: nivel.codigo,
      descricao: nivel.descricao
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveNivel(): void {
    this.saving.set(true);
    const professorId = 1;

    if (this.editingNivel()) {
      this.apiService.updateNivelTurma(this.editingNivel()!.id, this.form).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadNiveis();
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.apiService.createNivelTurma(professorId, this.form).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadNiveis();
        },
        error: () => this.saving.set(false)
      });
    }
  }

  deleteNivel(id: number): void {
    if (confirm('Tem certeza que deseja excluir este nível?')) {
      this.apiService.deleteNivelTurma(id).subscribe({
        next: () => this.loadNiveis(),
        error: () => alert('Erro ao excluir nível')
      });
    }
  }

  // Drag and drop para reordenar
  onDragStart(index: number): void {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === index) return;

    const niveis = [...this.niveis()];
    const dragItem = niveis[this.dragIndex];
    niveis.splice(this.dragIndex, 1);
    niveis.splice(index, 0, dragItem);
    
    // Atualizar ordem local
    niveis.forEach((n, i) => n.ordem = i + 1);
    
    this.niveis.set(niveis);
    this.dragIndex = index;
  }

  onDragEnd(): void {
    this.dragIndex = null;
    
    // Salvar nova ordem no backend
    const professorId = 1;
    const ids = this.niveis().map(n => n.id);
    
    this.apiService.reordenarNiveisTurma(professorId, ids).subscribe({
      error: () => console.error('Erro ao salvar ordem')
    });
  }
}
