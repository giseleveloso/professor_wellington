import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CategoriaVideo, SubcategoriaVideo } from '../../core/models/user.model';

@Component({
  selector: 'app-subcategorias-video',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📁 Subcategorias de Vídeo</h2>
        @if (categoriaAtual()) {
          <div class="breadcrumb">
            <button class="breadcrumb-item" (click)="voltarCategorias()">
              Categorias
            </button>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active" [style.color]="categoriaAtual()?.cor">
              {{ categoriaAtual()?.nome }}
            </span>
            @if (subcategoriaPai()) {
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item active">
                {{ subcategoriaPai()?.nome }}
              </span>
            }
          </div>
        }
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Subcategoria
      </button>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
        <p>Carregando subcategorias...</p>
      </div>
    } @else if (subcategorias().length === 0) {
      <div class="card">
        <div class="empty-state">
          <span class="empty-icon">📁</span>
          <h3>Nenhuma subcategoria cadastrada</h3>
          <p class="text-muted">
            @if (subcategoriaPai()) {
              Crie subcategorias dentro de "{{ subcategoriaPai()?.nome }}"
            } @else if (categoriaAtual()) {
              Crie subcategorias dentro de "{{ categoriaAtual()?.nome }}"
            } @else {
              Selecione uma categoria primeiro
            }
          </p>
          @if (categoriaAtual()) {
            <button class="btn btn-primary mt-4" (click)="openModal()">
              Criar Subcategoria
            </button>
          }
        </div>
      </div>
    } @else {
      <div class="subcategorias-grid">
        @for (sub of subcategorias(); track sub.id) {
          <div class="card subcategoria-card" [style.border-left]="'4px solid ' + categoriaAtual()?.cor">
            <div class="subcategoria-header">
              <div class="subcategoria-icon">
                @if (sub.subcategoriasFilhas && sub.subcategoriasFilhas.length > 0) {
                  📂
                } @else {
                  📄
                }
              </div>
              <div class="subcategoria-actions">
                @if (sub.subcategoriasFilhas && sub.subcategoriasFilhas.length > 0) {
                  <button class="btn btn-icon btn-sm" (click)="navegarParaFilhas(sub)" title="Ver subcategorias">
                    ▶️
                  </button>
                }
                <button class="btn btn-icon btn-sm" (click)="editSubcategoria(sub)" title="Editar">
                  ✏️
                </button>
                <button class="btn btn-icon btn-sm" (click)="deleteSubcategoria(sub.id)" title="Excluir">
                  🗑️
                </button>
              </div>
            </div>

            <h3 class="subcategoria-nome">{{ sub.nome }}</h3>

            @if (sub.descricao) {
              <p class="subcategoria-descricao">{{ sub.descricao }}</p>
            }

            <div class="subcategoria-footer">
              <span class="badge">Nível {{ sub.nivel }}</span>
              @if (sub.subcategoriasFilhas && sub.subcategoriasFilhas.length > 0) {
                <span class="badge badge-secondary">
                  {{ sub.subcategoriasFilhas.length }} {{ sub.subcategoriasFilhas.length === 1 ? 'subpasta' : 'subpastas' }}
                </span>
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
            <h3>{{ editingSubcategoria() ? 'Editar Subcategoria' : 'Nova Subcategoria' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>

          <form class="modal-body" (ngSubmit)="saveSubcategoria()">
            @if (categoriaAtual()) {
              <div class="info-box">
                <strong>Categoria:</strong>
                <span [style.color]="categoriaAtual()?.cor">{{ categoriaAtual()?.nome }}</span>
              </div>
            }

            @if (subcategoriaPai()) {
              <div class="info-box">
                <strong>Subcategoria pai:</strong> {{ subcategoriaPai()?.nome }}
              </div>
            }

            <div class="form-group">
              <label class="form-label">Nome da Subcategoria *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="form.nome"
                name="nome"
                placeholder="Ex: Kids, Teens, Adults"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea
                class="form-control"
                [(ngModel)]="form.descricao"
                name="descricao"
                rows="3"
                placeholder="Descrição breve da subcategoria"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || !form.nome">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                {{ editingSubcategoria() ? 'Salvar' : 'Criar Subcategoria' }}
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
      h2 { margin-bottom: 0.5rem; }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .breadcrumb-item {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      &:hover { opacity: 0.8; }
      &.active {
        color: var(--gray-700);
        font-weight: 600;
        text-decoration: none;
        cursor: default;
      }
    }

    .breadcrumb-separator {
      color: var(--gray-400);
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--gray-500);
      .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    }

    .subcategorias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .subcategoria-card {
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .subcategoria-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .subcategoria-icon {
      font-size: 2rem;
    }

    .subcategoria-actions {
      display: flex;
      gap: 0.25rem;
    }

    .subcategoria-nome {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--gray-800);
    }

    .subcategoria-descricao {
      font-size: 0.875rem;
      color: var(--gray-500);
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .subcategoria-footer {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: var(--primary-color);
      color: white;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      &.badge-secondary {
        background: var(--gray-400);
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

    .info-box {
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      strong {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--gray-600);
      }
      span {
        font-weight: 600;
      }
    }
  `]
})
export class SubcategoriasVideoComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categoriaAtual = signal<CategoriaVideo | null>(null);
  subcategoriaPai = signal<SubcategoriaVideo | null>(null);
  subcategorias = signal<SubcategoriaVideo[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingSubcategoria = signal<SubcategoriaVideo | null>(null);

  form = {
    nome: '',
    descricao: ''
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoriaId = params['categoria'];
      const subcategoriaPaiId = params['pai'];

      if (categoriaId) {
        this.loadCategoria(+categoriaId);
      }

      if (subcategoriaPaiId) {
        this.loadSubcategoriaPai(+subcategoriaPaiId);
      } else {
        this.subcategoriaPai.set(null);
      }

      this.loadSubcategorias(categoriaId, subcategoriaPaiId);
    });
  }

  loadCategoria(id: number): void {
    this.apiService.getCategoria(id).subscribe({
      next: (data) => {
        this.categoriaAtual.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar categoria:', err);
        alert('Erro ao carregar categoria');
      }
    });
  }

  loadSubcategoriaPai(id: number): void {
    this.apiService.getSubcategoria(id).subscribe({
      next: (data) => {
        this.subcategoriaPai.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar subcategoria pai:', err);
      }
    });
  }

  loadSubcategorias(categoriaId: string, subcategoriaPaiId: string): void {
    this.loading.set(true);

    let request;
    if (subcategoriaPaiId) {
      request = this.apiService.getSubcategoriasByPai(+subcategoriaPaiId);
    } else if (categoriaId) {
      request = this.apiService.getSubcategoriasRaizes(+categoriaId);
    } else {
      this.loading.set(false);
      return;
    }

    request.subscribe({
      next: (data) => {
        this.subcategorias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar subcategorias:', err);
        alert('Erro ao carregar subcategorias');
        this.loading.set(false);
      }
    });
  }

  openModal(): void {
    if (!this.categoriaAtual()) {
      alert('Selecione uma categoria primeiro');
      return;
    }

    this.editingSubcategoria.set(null);
    this.form = {
      nome: '',
      descricao: ''
    };
    this.showModal.set(true);
  }

  editSubcategoria(sub: SubcategoriaVideo): void {
    this.editingSubcategoria.set(sub);
    this.form = {
      nome: sub.nome,
      descricao: sub.descricao || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveSubcategoria(): void {
    if (!this.form.nome || !this.categoriaAtual()) return;

    this.saving.set(true);

    const data = {
      nome: this.form.nome.trim(),
      descricao: this.form.descricao?.trim() || null,
      idCategoriaRaiz: this.categoriaAtual()!.id,
      idSubcategoriaPai: this.subcategoriaPai()?.id || null
    };

    const request = this.editingSubcategoria()
      ? this.apiService.updateSubcategoria(this.editingSubcategoria()!.id, data)
      : this.apiService.createSubcategoria(data);

    request.subscribe({
      next: () => {
        const categoriaId = this.categoriaAtual()!.id;
        const paiId = this.subcategoriaPai()?.id;
        this.loadSubcategorias(categoriaId.toString(), paiId?.toString() || '');
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Erro ao salvar subcategoria:', err);
        alert(err.error?.message || 'Erro ao salvar subcategoria');
        this.saving.set(false);
      }
    });
  }

  deleteSubcategoria(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;

    this.apiService.deleteSubcategoria(id).subscribe({
      next: () => {
        const categoriaId = this.categoriaAtual()!.id;
        const paiId = this.subcategoriaPai()?.id;
        this.loadSubcategorias(categoriaId.toString(), paiId?.toString() || '');
      },
      error: (err) => {
        console.error('Erro ao excluir subcategoria:', err);
        alert(err.error?.message || 'Erro ao excluir subcategoria. Verifique se não há subcategorias ou vídeos associados.');
      }
    });
  }

  navegarParaFilhas(sub: SubcategoriaVideo): void {
    this.router.navigate(['/subcategorias-video'], {
      queryParams: {
        categoria: this.categoriaAtual()!.id,
        pai: sub.id
      }
    });
  }

  voltarCategorias(): void {
    this.router.navigate(['/categorias-video']);
  }
}
