import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MaterialExtraAula, Turma, CategoriaVideo, SubcategoriaVideo } from '../../core/models/user.model';

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

    <!-- Categorias -->
    <div class="filters-section mb-4">
      <div class="categories">
        <button
          [class]="'category-btn ' + (!categoriaAtiva() ? 'active' : '')"
          (click)="filterByCategoria(null)"
        >
          📁 Todas as Categorias
        </button>
        @for (cat of categorias(); track cat.id) {
          <button
            [class]="'category-btn ' + (categoriaAtiva()?.id === cat.id ? 'active' : '')"
            [style.border-color]="categoriaAtiva()?.id === cat.id ? cat.cor : ''"
            [style.color]="categoriaAtiva()?.id === cat.id ? cat.cor : ''"
            (click)="filterByCategoria(cat)"
          >
            <span class="color-dot" [style.background-color]="cat.cor"></span>
            {{ cat.nome }}
          </button>
        }
      </div>

      @if (categoriaAtiva() && subcategorias().length > 0) {
        <div class="subcategories">
          <button
            [class]="'subcategory-btn ' + (!subcategoriaAtiva() ? 'active' : '')"
            (click)="filterBySubcategoria(null)"
          >
            Todas
          </button>
          @for (sub of subcategorias(); track sub.id) {
            <button
              [class]="'subcategory-btn ' + (subcategoriaAtiva()?.id === sub.id ? 'active' : '')"
              (click)="filterBySubcategoria(sub)"
            >
              {{ sub.nome }}
            </button>
          }
        </div>
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
                @if (material.categoria) {
                  <span class="badge" [style.background-color]="material.categoria.cor" style="color: white;">
                    {{ material.categoria.nome }}
                  </span>
                }
                @if (material.subcategoria) {
                  <span class="badge badge-secondary">{{ material.subcategoria.nome }}</span>
                }
              </div>
            </div>
            <div class="material-actions">
              @if (material.urlArquivo) {
                <a [href]="material.urlArquivo" target="_blank" class="btn btn-primary btn-sm">
                  🔗 Acessar
                </a>
              }
              @if (material.nomeArquivo && isPdf(material.nomeArquivo)) {
                <button class="btn btn-primary btn-sm" (click)="openPdfViewer(material)">
                  👁️ Visualizar
                </button>
              }
              @if (material.nomeArquivo) {
                <button class="btn btn-outline btn-sm" (click)="downloadFile(material)">
                  ⬇️ Baixar
                </button>
              }
              @if (authService.isProfessor() && !material.nomeArquivo) {
                <button class="btn btn-outline btn-sm" (click)="openUploadModal(material)">
                  📎 Upload
                </button>
              }
              @if (authService.isProfessor()) {
                <button class="btn btn-icon btn-sm" (click)="openEditModal(material)" title="Editar">
                  ✏️
                </button>
                <button class="btn btn-icon btn-sm btn-danger" (click)="deleteMaterial(material.id)" title="Excluir">
                  🗑️
                </button>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- PDF Viewer Modal -->
    @if (pdfAtivo()) {
      <div class="modal-overlay" (click)="closePdfViewer()">
        <div class="pdf-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ pdfAtivo()?.titulo }}</h3>
            <button class="btn btn-icon" (click)="closePdfViewer()">✕</button>
          </div>
          <div class="pdf-viewer">
            @if (pdfUrl()) {
              <iframe
                [src]="pdfUrl()"
                frameborder="0"
              ></iframe>
            } @else {
              <div class="loading-state"><span class="spinner"></span> Carregando PDF...</div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Upload Modal -->
    @if (showUploadModal()) {
      <div class="modal-overlay" (click)="closeUploadModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Upload de Arquivo</h3>
            <button class="btn btn-icon" (click)="closeUploadModal()">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-4">Selecione um arquivo para o material: <strong>{{ uploadMaterial()?.titulo }}</strong></p>
            <div class="form-group">
              <label class="form-label">Arquivo</label>
              <input type="file" class="form-control" (change)="onFileSelected($event)" />
            </div>
            @if (uploading()) {
              <div class="loading-state"><span class="spinner"></span> Enviando...</div>
            }
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeUploadModal()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="uploadFile()" [disabled]="!selectedFile || uploading()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId() ? 'Editar Material' : 'Novo Material' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-body" (ngSubmit)="saveMaterial()">
            <div class="form-group">
              <label class="form-label">Título *</label>
              <input type="text" class="form-control" [(ngModel)]="form.titulo" name="titulo" required />
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo *</label>
                <select class="form-control" [(ngModel)]="form.idTipoConteudo" name="idTipoConteudo">
                  @for (tipo of tipos.slice(1); track tipo.id) {
                    <option [value]="tipo.id">{{ tipo.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Turma *</label>
                <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma" required>
                  @for (turma of turmas(); track turma.id) {
                    <option [value]="turma.id">{{ turma.nome }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select class="form-control" [(ngModel)]="form.idCategoria" name="idCategoria"
                      (change)="onCategoriaFormChange()">
                <option [value]="null">Sem categoria</option>
                @for (cat of categorias(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nome }}</option>
                }
              </select>
            </div>

            @if (form.idCategoria && subcategoriasForm().length > 0) {
              <div class="form-group">
                <label class="form-label">Subcategoria (opcional)</label>
                <select class="form-control" [(ngModel)]="form.idSubcategoria" name="idSubcategoria">
                  <option [value]="null">Nenhuma</option>
                  @for (sub of subcategoriasForm(); track sub.id) {
                    <option [value]="sub.id">{{ sub.nome }}</option>
                  }
                </select>
              </div>
            }

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

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .categories { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .category-btn {
      padding: 0.5rem 1rem;
      border: 2px solid var(--gray-200);
      background: var(--white);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      &:hover { border-color: var(--gray-400); }
      &.active {
        background: var(--white);
        border-width: 2px;
        font-weight: 600;
      }
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .subcategories {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-left: 1rem;
      border-left: 3px solid var(--gray-200);
    }

    .subcategory-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--gray-200);
      background: var(--white);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      &:hover { border-color: var(--gray-400); background: var(--gray-50); }
      &.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        font-weight: 600;
      }
    }

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
    .material-meta { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .material-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; }
    .pdf-modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .pdf-viewer {
      flex: 1;
      min-height: 70vh;
      iframe { width: 100%; height: 70vh; }
    }
  `]
})
export class MateriaisComponent implements OnInit {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);

  materiais = signal<MaterialExtraAula[]>([]);
  materiaisFiltrados = signal<MaterialExtraAula[]>([]);
  turmas = signal<Turma[]>([]);
  categorias = signal<CategoriaVideo[]>([]);
  subcategorias = signal<SubcategoriaVideo[]>([]);
  subcategoriasForm = signal<SubcategoriaVideo[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  showUploadModal = signal(false);
  uploading = signal(false);
  pdfAtivo = signal<MaterialExtraAula | null>(null);
  pdfUrl = signal<SafeResourceUrl | null>(null);
  uploadMaterial = signal<MaterialExtraAula | null>(null);
  categoriaAtiva = signal<CategoriaVideo | null>(null);
  subcategoriaAtiva = signal<SubcategoriaVideo | null>(null);
  tipoAtivo = 0;
  selectedFile: File | null = null;

  tipos = [
    { id: 0, label: 'Todos', icon: '📚' },
    { id: 1, label: 'Leitura', icon: '📖' },
    { id: 2, label: 'Vídeo', icon: '🎬' },
    { id: 3, label: 'Áudio', icon: '🎧' },
    { id: 4, label: 'Link', icon: '🔗' },
    { id: 5, label: 'PDF', icon: '📄' }
  ];

  form: any = {
    titulo: '', descricao: '', idTipoConteudo: 1, urlArquivo: '', idTurma: 0,
    idCategoria: null, idSubcategoria: null
  };

  ngOnInit(): void {
    this.loadCategorias();
    this.loadMateriais();

    const turmasRequest = this.authService.isProfessor()
      ? this.apiService.getTurmas()
      : this.apiService.getMinhasTurmas();

    turmasRequest.subscribe(t => {
      this.turmas.set(t);
      if (t.length) this.form.idTurma = t[0].id;
    });
  }

  loadCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  loadMateriais(): void {
    this.loading.set(true);

    // Todos os alunos podem ver todos os materiais publicados
    this.apiService.getMateriais().subscribe({
      next: m => { this.materiais.set(m); this.materiaisFiltrados.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filterByCategoria(cat: CategoriaVideo | null): void {
    this.categoriaAtiva.set(cat);
    this.subcategoriaAtiva.set(null);

    if (cat) {
      this.apiService.getSubcategoriasByCategoria(cat.id).subscribe({
        next: (data) => this.subcategorias.set(data),
        error: () => this.subcategorias.set([])
      });
    } else {
      this.subcategorias.set([]);
    }

    this.applyFilters();
  }

  filterBySubcategoria(sub: SubcategoriaVideo | null): void {
    this.subcategoriaAtiva.set(sub);
    this.applyFilters();
  }

  filterByTipo(id: number): void {
    this.tipoAtivo = id;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.materiais();

    // Filtro por categoria/subcategoria
    if (this.subcategoriaAtiva()) {
      filtered = filtered.filter(m => m.subcategoria?.id === this.subcategoriaAtiva()!.id);
    } else if (this.categoriaAtiva()) {
      filtered = filtered.filter(m => m.categoria?.id === this.categoriaAtiva()!.id);
    }

    // Filtro por tipo
    if (this.tipoAtivo !== 0) {
      filtered = filtered.filter(m => m.tipoConteudo.id === this.tipoAtivo);
    }

    this.materiaisFiltrados.set(filtered);
  }

  onCategoriaFormChange(): void {
    this.form.idSubcategoria = null;

    if (this.form.idCategoria) {
      this.apiService.getSubcategoriasByCategoria(this.form.idCategoria).subscribe({
        next: (data) => this.subcategoriasForm.set(data),
        error: () => this.subcategoriasForm.set([])
      });
    } else {
      this.subcategoriasForm.set([]);
    }
  }

  getTipoIcon(id: number): string {
    return this.tipos.find(t => t.id === id)?.icon || '📄';
  }

  downloadFile(material: MaterialExtraAula): void {
    this.http.get(`http://localhost:8080/materiais/download/${material.nomeArquivo}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.nomeArquivo;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao baixar arquivo:', err);
        alert('Erro ao baixar o arquivo');
      }
    });
  }

  isPdf(nomeArquivo: string): boolean {
    return nomeArquivo?.toLowerCase().endsWith('.pdf');
  }

  openPdfViewer(material: MaterialExtraAula): void {
    this.pdfAtivo.set(material);
    this.pdfUrl.set(null);

    this.http.get(`http://localhost:8080/materiais/view/${material.nomeArquivo}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      },
      error: (err) => {
        console.error('Erro ao carregar PDF:', err);
        alert('Erro ao carregar o PDF');
        this.pdfAtivo.set(null);
      }
    });
  }

  closePdfViewer(): void {
    this.pdfAtivo.set(null);
    this.pdfUrl.set(null);
  }

  // Upload
  openUploadModal(material: MaterialExtraAula): void {
    this.uploadMaterial.set(material);
    this.selectedFile = null;
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.uploadMaterial.set(null);
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.uploadMaterial()) return;

    this.uploading.set(true);
    const formData = new FormData();
    formData.append('nomeArquivo', this.selectedFile.name);
    formData.append('arquivo', this.selectedFile);

    this.apiService.uploadMaterialFile(this.uploadMaterial()!.id, formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.closeUploadModal();
        this.loadMateriais();
      },
      error: (err) => {
        this.uploading.set(false);
        console.error('Erro ao fazer upload:', err);
        alert(err.error?.message || err.error || 'Erro ao fazer upload do arquivo');
      }
    });
  }

  // Create modal
  openModal(): void {
    this.editingId.set(null);
    this.form = {
      titulo: '', descricao: '', idTipoConteudo: 1, urlArquivo: '',
      idTurma: this.turmas()[0]?.id || 0,
      idCategoria: null, idSubcategoria: null
    };
    this.subcategoriasForm.set([]);
    this.showModal.set(true);
  }

  openEditModal(material: MaterialExtraAula): void {
    this.editingId.set(material.id);
    this.form = {
      titulo: material.titulo,
      descricao: material.descricao || '',
      idTipoConteudo: material.tipoConteudo?.id || 1,
      urlArquivo: material.urlArquivo || '',
      idTurma: material.idTurma || 0,
      idCategoria: material.categoria?.id || null,
      idSubcategoria: material.subcategoria?.id || null
    };

    if (material.categoria?.id) {
      this.apiService.getSubcategoriasByCategoria(material.categoria.id).subscribe({
        next: (data) => this.subcategoriasForm.set(data),
        error: () => this.subcategoriasForm.set([])
      });
    } else {
      this.subcategoriasForm.set([]);
    }

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveMaterial(): void {
    if (!this.form.titulo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const request = this.editingId()
      ? this.apiService.updateMaterial(this.editingId()!, this.form)
      : this.apiService.createMaterial(this.form);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadMateriais();
      },
      error: (err) => {
        console.error('Erro ao salvar material:', err);
        alert(err.error?.message || 'Erro ao salvar material');
      }
    });
  }

  deleteMaterial(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    this.apiService.deleteMaterial(id).subscribe({
      next: () => this.loadMateriais(),
      error: (err) => {
        console.error('Erro ao excluir material:', err);
        alert(err.error?.message || 'Erro ao excluir material');
      }
    });
  }
}
