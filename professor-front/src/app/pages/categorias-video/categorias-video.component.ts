import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CategoriaVideo } from '../../core/models/user.model';

@Component({
  selector: 'app-categorias-video',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🏷️ Categorias de Vídeo</h2>
        <p class="text-muted">Gerencie as categorias para organizar seus vídeos</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Categoria
      </button>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
        <p>Carregando categorias...</p>
      </div>
    } @else if (categorias().length === 0) {
      <div class="card">
        <div class="empty-state">
          <span class="empty-icon">🏷️</span>
          <h3>Nenhuma categoria cadastrada</h3>
          <p class="text-muted">Crie categorias para organizar seus vídeos</p>
          <button class="btn btn-primary mt-4" (click)="openModal()">
            Criar Categoria
          </button>
        </div>
      </div>
    } @else {
      <div class="categorias-grid">
        @for (cat of categorias(); track cat.id) {
          <div class="card categoria-card" [style.border-left]="'4px solid ' + cat.cor">
            <div class="categoria-header">
              <div class="categoria-color" [style.background-color]="cat.cor"></div>
              <div class="categoria-actions">
                <button class="btn btn-icon btn-sm" (click)="verSubcategorias(cat)" title="Ver subcategorias">
                  📁
                </button>
                <button class="btn btn-icon btn-sm" (click)="editCategoria(cat)" title="Editar">
                  ✏️
                </button>
                <button class="btn btn-icon btn-sm" (click)="deleteCategoria(cat.id)" title="Excluir">
                  🗑️
                </button>
              </div>
            </div>

            <h3 class="categoria-nome">{{ cat.nome }}</h3>

            @if (cat.descricao) {
              <p class="categoria-descricao">{{ cat.descricao }}</p>
            }
          </div>
        }
      </div>
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCategoria() ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>

          <form class="modal-body" (ngSubmit)="saveCategoria()">
            <div class="form-group">
              <label class="form-label">Nome da Categoria *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="form.nome"
                name="nome"
                placeholder="Ex: Gramática, Vocabulário"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Cor *</label>
              <div class="color-selector">
                @for (color of coresDisponiveis; track color) {
                  <button
                    type="button"
                    class="color-btn"
                    [class.selected]="form.cor === color"
                    [style.background-color]="color"
                    (click)="form.cor = color"
                    [title]="color"
                  ></button>
                }
              </div>
              <input
                type="color"
                class="form-control mt-2"
                [(ngModel)]="form.cor"
                name="cor"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea
                class="form-control"
                [(ngModel)]="form.descricao"
                name="descricao"
                rows="3"
                placeholder="Descrição breve da categoria"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || !form.nome || !form.cor">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                {{ editingCategoria() ? 'Salvar' : 'Criar Categoria' }}
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

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--gray-500);
      .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    }

    .categorias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .categoria-card {
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .categoria-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .categoria-color {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .categoria-actions {
      display: flex;
      gap: 0.25rem;
    }

    .categoria-nome {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--gray-800);
    }

    .categoria-descricao {
      font-size: 0.875rem;
      color: var(--gray-500);
      line-height: 1.5;
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

    .color-selector {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 0.5rem;
    }

    .color-btn {
      width: 100%;
      aspect-ratio: 1;
      border: 2px solid var(--gray-200);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        transform: scale(1.1);
        border-color: var(--gray-400);
      }
      &.selected {
        border-color: var(--gray-800);
        border-width: 3px;
        transform: scale(1.05);
      }
    }
  `]
})
export class CategoriasVideoComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  categorias = signal<CategoriaVideo[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingCategoria = signal<CategoriaVideo | null>(null);

  coresDisponiveis = [
    '#1e3a5f', '#2d5a8e', '#3B82F6', '#22C55E',
    '#EC4899', '#F59E0B', '#c9a96e', '#8B5CF6',
    '#EF4444', '#10B981', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#84CC16', '#64748B'
  ];

  form = {
    nome: '',
    cor: '#1e3a5f',
    descricao: ''
  };

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.apiService.getCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
        alert('Erro ao carregar categorias');
        this.loading.set(false);
      }
    });
  }

  openModal(): void {
    this.editingCategoria.set(null);
    this.form = {
      nome: '',
      cor: '#1e3a5f',
      descricao: ''
    };
    this.showModal.set(true);
  }

  editCategoria(cat: CategoriaVideo): void {
    this.editingCategoria.set(cat);
    this.form = {
      nome: cat.nome,
      cor: cat.cor,
      descricao: cat.descricao || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveCategoria(): void {
    if (!this.form.nome || !this.form.cor) return;

    this.saving.set(true);

    const data = {
      nome: this.form.nome.trim(),
      cor: this.form.cor,
      descricao: this.form.descricao?.trim() || null
    };

    const request = this.editingCategoria()
      ? this.apiService.updateCategoria(this.editingCategoria()!.id, data)
      : this.apiService.createCategoria(data);

    request.subscribe({
      next: () => {
        this.loadCategorias();
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Erro ao salvar categoria:', err);
        alert(err.error?.message || 'Erro ao salvar categoria');
        this.saving.set(false);
      }
    });
  }

  deleteCategoria(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    this.apiService.deleteCategoria(id).subscribe({
      next: () => {
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Erro ao excluir categoria:', err);
        alert(err.error?.message || 'Erro ao excluir categoria. Verifique se não há vídeos ou subcategorias associadas.');
      }
    });
  }

  verSubcategorias(cat: CategoriaVideo): void {
    this.router.navigate(['/subcategorias-video'], { queryParams: { categoria: cat.id } });
  }
}
