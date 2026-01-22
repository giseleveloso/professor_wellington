import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Video, Turma, CategoriaVideo, SubcategoriaVideo } from '../../core/models/user.model';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🎬 Vídeos de Aula</h2>
        <p class="text-muted">Assista aos vídeos disponibilizados</p>
      </div>
      @if (authService.isProfessor()) {
        <button class="btn btn-primary" (click)="openModal()">+ Novo Vídeo</button>
      }
    </div>

    <!-- Filtros -->
    <div class="filters-section mb-4">
      <div class="categories">
        <button
          [class]="'category-btn ' + (!categoriaAtiva() ? 'active' : '')"
          (click)="filterByCategoria(null)"
        >
          📚 Todas as Categorias
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

    @if (loading()) {
      <div class="loading-state"><span class="spinner"></span></div>
    } @else if (videosFiltrados().length === 0) {
      <div class="card empty-state">
        <span class="empty-icon">🎥</span>
        <h3>Nenhum vídeo encontrado</h3>
      </div>
    } @else {
      <div class="videos-grid">
        @for (video of videosFiltrados(); track video.id) {
          <div class="card video-card">
            <div class="video-thumbnail" (click)="openVideo(video)">
              <img [src]="getThumbnail(video.linkYoutube)" alt="">
              <span class="play-icon">▶</span>
            </div>
            <div class="video-info">
              <div class="video-header">
                <h4 (click)="openVideo(video)">{{ video.titulo }}</h4>
                @if (authService.isProfessor()) {
                  <button class="btn btn-icon btn-sm btn-danger" (click)="deleteVideo(video.id)" title="Excluir">
                    🗑️
                  </button>
                }
              </div>
              <p class="text-muted">{{ video.descricao }}</p>
              <div class="video-meta">
                @if (video.categoria) {
                  <span class="badge badge-primary" [style.background-color]="video.categoria.cor">
                    {{ video.categoria.nome }}
                  </span>
                }
                @if (video.subcategoria) {
                  <span class="badge badge-secondary">{{ video.subcategoria.nome }}</span>
                }
                <span class="badge badge-info">{{ video.nomeTurma }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Player Modal -->
    @if (videoAtivo()) {
      <div class="modal-overlay" (click)="closeVideo()">
        <div class="video-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ videoAtivo()?.titulo }}</h3>
            <button class="btn btn-icon" (click)="closeVideo()">✕</button>
          </div>
          <div class="video-player">
            <iframe 
              [src]="getEmbedUrl(videoAtivo()!.linkYoutube)"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <div class="video-description">
            <p>{{ videoAtivo()?.descricao }}</p>
          </div>
        </div>
      </div>
    }

    <!-- Form Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Novo Vídeo</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-body" (ngSubmit)="saveVideo()">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input type="text" class="form-control" [(ngModel)]="form.titulo" name="titulo" required />
            </div>
            <div class="form-group">
              <label class="form-label">Link do YouTube</label>
              <input type="url" class="form-control" [(ngModel)]="form.linkYoutube" name="linkYoutube" required 
                placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Turma *</label>
              <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma" required>
                @for (turma of turmas(); track turma.id) {
                  <option [value]="turma.id">{{ turma.nome }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Categoria *</label>
              <select class="form-control" [(ngModel)]="form.idCategoria" name="idCategoria"
                      (change)="onCategoriaChange()" required>
                <option [value]="null">Selecione uma categoria</option>
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
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        font-weight: 600;
      }
    }

    .loading-state, .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }

    .videos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 1024px) { .videos-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .videos-grid { grid-template-columns: 1fr; } }

    .video-card {
      padding: 0;
      overflow: hidden;
      transition: transform 0.2s;
      &:hover { transform: translateY(-4px); }
    }

    .video-thumbnail {
      position: relative;
      aspect-ratio: 16/9;
      background: var(--gray-200);
      cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
      .play-icon {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 60px; height: 60px;
        background: rgba(0,0,0,0.7);
        color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem;
      }
    }

    .video-info {
      padding: 1rem;
    }

    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      h4 {
        margin: 0;
        flex: 1;
        cursor: pointer;
        &:hover { color: var(--primary-color); }
      }
    }

    .video-meta { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; }
    .video-modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .video-player {
      aspect-ratio: 16/9;
      iframe { width: 100%; height: 100%; }
    }
    .video-description { padding: 1rem 1.5rem; }
  `]
})
export class VideosComponent implements OnInit {
  private apiService = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);

  videos = signal<Video[]>([]);
  videosFiltrados = signal<Video[]>([]);
  turmas = signal<Turma[]>([]);
  categorias = signal<CategoriaVideo[]>([]);
  subcategorias = signal<SubcategoriaVideo[]>([]);
  subcategoriasForm = signal<SubcategoriaVideo[]>([]);
  loading = signal(true);
  showModal = signal(false);
  videoAtivo = signal<Video | null>(null);
  categoriaAtiva = signal<CategoriaVideo | null>(null);
  subcategoriaAtiva = signal<SubcategoriaVideo | null>(null);

  form = {
    titulo: '',
    linkYoutube: '',
    descricao: '',
    idCategoria: null as number | null,
    idSubcategoria: null as number | null,
    idTurma: 0
  };

  ngOnInit(): void {
    this.loadCategorias();
    this.loadVideos();

    // Carregar turmas baseado no perfil
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
      next: (data) => {
        this.categorias.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
      }
    });
  }

  loadVideos(): void {
    this.loading.set(true);

    // Usar endpoint diferente baseado no perfil
    const request = this.authService.isProfessor()
      ? this.apiService.getVideos()
      : this.apiService.getMeusVideos();

    request.subscribe({
      next: v => {
        this.videos.set(v);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByCategoria(cat: CategoriaVideo | null): void {
    this.categoriaAtiva.set(cat);
    this.subcategoriaAtiva.set(null);

    if (cat) {
      this.apiService.getSubcategoriasByCategoria(cat.id).subscribe({
        next: (data) => {
          this.subcategorias.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar subcategorias:', err);
          this.subcategorias.set([]);
        }
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

  applyFilters(): void {
    let filtered = this.videos();

    if (this.subcategoriaAtiva()) {
      filtered = filtered.filter(v => v.subcategoria?.id === this.subcategoriaAtiva()!.id);
    } else if (this.categoriaAtiva()) {
      filtered = filtered.filter(v => v.categoria?.id === this.categoriaAtiva()!.id);
    }

    this.videosFiltrados.set(filtered);
  }

  onCategoriaChange(): void {
    this.form.idSubcategoria = null;

    if (this.form.idCategoria) {
      this.apiService.getSubcategoriasByCategoria(this.form.idCategoria).subscribe({
        next: (data) => {
          this.subcategoriasForm.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar subcategorias:', err);
          this.subcategoriasForm.set([]);
        }
      });
    } else {
      this.subcategoriasForm.set([]);
    }
  }

  getThumbnail(link: string): string {
    const videoId = this.extractVideoId(link);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }

  getEmbedUrl(link: string): SafeResourceUrl {
    const videoId = this.extractVideoId(link);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
  }

  openVideo(video: Video): void {
    this.videoAtivo.set(video);
  }

  closeVideo(): void {
    this.videoAtivo.set(null);
  }

  openModal(): void {
    this.form = {
      titulo: '',
      linkYoutube: '',
      descricao: '',
      idCategoria: null,
      idSubcategoria: null,
      idTurma: this.turmas()[0]?.id || 0
    };
    this.subcategoriasForm.set([]);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveVideo(): void {
    if (!this.form.titulo || !this.form.linkYoutube || !this.form.idTurma || !this.form.idCategoria) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.apiService.createVideo(this.form).subscribe({
      next: () => {
        this.closeModal();
        this.loadVideos();
      },
      error: (err) => {
        console.error('Erro ao salvar vídeo:', err);
        alert(err.error?.message || 'Erro ao salvar vídeo');
      }
    });
  }

  deleteVideo(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    this.apiService.deleteVideo(id).subscribe({
      next: () => {
        this.loadVideos();
      },
      error: (err) => {
        console.error('Erro ao excluir vídeo:', err);
        alert(err.error?.message || 'Erro ao excluir vídeo');
      }
    });
  }
}
