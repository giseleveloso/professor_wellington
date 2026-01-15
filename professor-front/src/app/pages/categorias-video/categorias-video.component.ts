import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface CategoriaVideo {
  id: number;
  label: string;
  icon: string;
  descricao?: string;
  quantidadeVideos?: number;
}

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
          <div class="card categoria-card">
            <div class="categoria-header">
              <div class="categoria-icon-wrapper">
                <span class="categoria-icon">{{ cat.icon }}</span>
              </div>
              <div class="categoria-actions">
                <button class="btn btn-icon btn-sm" (click)="editCategoria(cat)">✏️</button>
                <button class="btn btn-icon btn-sm" (click)="deleteCategoria(cat.id)">🗑️</button>
              </div>
            </div>
            
            <h3 class="categoria-nome">{{ cat.label }}</h3>
            
            @if (cat.descricao) {
              <p class="categoria-descricao">{{ cat.descricao }}</p>
            }
            
            <div class="categoria-footer">
              <span class="videos-count">
                <span class="count">{{ cat.quantidadeVideos || 0 }}</span> vídeos
              </span>
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
            <h3>{{ editingCategoria() ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveCategoria()">
            <div class="form-group">
              <label class="form-label">Nome da Categoria</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.label" 
                name="label"
                placeholder="Ex: Gramática, Vocabulário"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Ícone (emoji)</label>
              <div class="icon-selector">
                @for (icon of iconsDisponiveis; track icon) {
                  <button 
                    type="button"
                    class="icon-btn"
                    [class.selected]="form.icon === icon"
                    (click)="form.icon = icon"
                  >
                    {{ icon }}
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <textarea 
                class="form-control" 
                [(ngModel)]="form.descricao" 
                name="descricao"
                rows="2"
                placeholder="Descrição breve da categoria"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || !form.label">
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
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;

      @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 600px) { grid-template-columns: 1fr; }
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
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .categoria-icon-wrapper {
      width: 56px;
      height: 56px;
      background: var(--primary-bg);
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .categoria-icon {
      font-size: 2rem;
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
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .categoria-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
    }

    .videos-count {
      font-size: 0.875rem;
      color: var(--gray-600);

      .count {
        font-weight: 700;
        color: var(--primary);
      }
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
      max-width: 450px;
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

    // Icon Selector
    .icon-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .icon-btn {
      width: 44px;
      height: 44px;
      font-size: 1.5rem;
      border: 2px solid var(--gray-200);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-light);
        background: var(--gray-50);
      }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-bg);
      }
    }
  `]
})
export class CategoriasVideoComponent implements OnInit {
  private apiService = inject(ApiService);

  categorias = signal<CategoriaVideo[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingCategoria = signal<CategoriaVideo | null>(null);

  iconsDisponiveis = ['📖', '💬', '📕', '🗣️', '🎵', '🎬', '📝', '🎯', '🧠', '✍️', '📚', '🌍', '🎤', '📢', '💡', '🔤'];

  form = {
    label: '',
    icon: '📖',
    descricao: ''
  };

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    
    // Carregar categorias - por enquanto usando dados locais
    // TODO: Implementar endpoint no backend para categorias de vídeo
    const categoriasDefault: CategoriaVideo[] = [
      { id: 1, label: 'Gramática', icon: '📖', descricao: 'Regras gramaticais e estruturas', quantidadeVideos: 0 },
      { id: 2, label: 'Vocabulário', icon: '💬', descricao: 'Palavras e expressões novas', quantidadeVideos: 0 },
      { id: 3, label: 'Histórias', icon: '📕', descricao: 'Contos e narrativas para prática', quantidadeVideos: 0 },
      { id: 4, label: 'Conversação', icon: '🗣️', descricao: 'Diálogos e situações reais', quantidadeVideos: 0 },
    ];

    // Simular carregamento
    setTimeout(() => {
      const saved = localStorage.getItem('categorias_video');
      if (saved) {
        this.categorias.set(JSON.parse(saved));
      } else {
        this.categorias.set(categoriasDefault);
        localStorage.setItem('categorias_video', JSON.stringify(categoriasDefault));
      }
      this.loading.set(false);
    }, 300);
  }

  openModal(): void {
    this.editingCategoria.set(null);
    this.form = {
      label: '',
      icon: '📖',
      descricao: ''
    };
    this.showModal.set(true);
  }

  editCategoria(cat: CategoriaVideo): void {
    this.editingCategoria.set(cat);
    this.form = {
      label: cat.label,
      icon: cat.icon,
      descricao: cat.descricao || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveCategoria(): void {
    this.saving.set(true);

    setTimeout(() => {
      const current = this.categorias();
      
      if (this.editingCategoria()) {
        // Editar
        const updated = current.map(c => 
          c.id === this.editingCategoria()!.id 
            ? { ...c, ...this.form }
            : c
        );
        this.categorias.set(updated);
        localStorage.setItem('categorias_video', JSON.stringify(updated));
      } else {
        // Criar nova
        const newCat: CategoriaVideo = {
          id: Math.max(0, ...current.map(c => c.id)) + 1,
          ...this.form,
          quantidadeVideos: 0
        };
        const updated = [...current, newCat];
        this.categorias.set(updated);
        localStorage.setItem('categorias_video', JSON.stringify(updated));
      }

      this.saving.set(false);
      this.closeModal();
    }, 300);
  }

  deleteCategoria(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      const updated = this.categorias().filter(c => c.id !== id);
      this.categorias.set(updated);
      localStorage.setItem('categorias_video', JSON.stringify(updated));
    }
  }
}
