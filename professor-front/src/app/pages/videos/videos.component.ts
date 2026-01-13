import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Video, Turma } from '../../core/models/user.model';

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

    <!-- Categorias -->
    <div class="categories mb-4">
      @for (cat of categorias; track cat.id) {
        <button 
          [class]="'category-btn ' + (categoriaAtiva === cat.id ? 'active' : '')"
          (click)="filterByCategoria(cat.id)"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
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
          <div class="card video-card" (click)="openVideo(video)">
            <div class="video-thumbnail">
              <img [src]="getThumbnail(video.linkYoutube)" alt="">
              <span class="play-icon">▶</span>
            </div>
            <div class="video-info">
              <h4>{{ video.titulo }}</h4>
              <p class="text-muted">{{ video.descricao }}</p>
              <div class="video-meta">
                <span class="badge badge-primary">{{ video.categoria.label }}</span>
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
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Categoria</label>
                <select class="form-control" [(ngModel)]="form.idCategoria" name="idCategoria">
                  @for (cat of categorias; track cat.id) {
                    <option [value]="cat.id">{{ cat.label }}</option>
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
    
    .categories { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .category-btn {
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

    .videos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 1024px) { .videos-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .videos-grid { grid-template-columns: 1fr; } }

    .video-card { 
      cursor: pointer; 
      padding: 0; 
      overflow: hidden;
      transition: transform 0.2s;
      &:hover { transform: translateY(-4px); }
    }

    .video-thumbnail {
      position: relative;
      aspect-ratio: 16/9;
      background: var(--gray-200);
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

    .video-info { padding: 1rem; h4 { margin-bottom: 0.5rem; } }
    .video-meta { display: flex; gap: 0.5rem; margin-top: 0.75rem; }

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
  loading = signal(true);
  showModal = signal(false);
  videoAtivo = signal<Video | null>(null);
  categoriaAtiva = 0;

  categorias = [
    { id: 0, label: 'Todos', icon: '📚' },
    { id: 1, label: 'Gramática', icon: '📖' },
    { id: 2, label: 'Vocabulário', icon: '💬' },
    { id: 3, label: 'Histórias', icon: '📕' },
    { id: 4, label: 'Conversação', icon: '🗣️' }
  ];

  form = { titulo: '', linkYoutube: '', descricao: '', idCategoria: 1, idTurma: 0 };

  ngOnInit(): void {
    this.loadVideos();
    this.apiService.getTurmas().subscribe(t => { this.turmas.set(t); if (t.length) this.form.idTurma = t[0].id; });
  }

  loadVideos(): void {
    this.loading.set(true);
    this.apiService.getVideos().subscribe({
      next: v => { this.videos.set(v); this.videosFiltrados.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filterByCategoria(id: number): void {
    this.categoriaAtiva = id;
    this.videosFiltrados.set(id === 0 ? this.videos() : this.videos().filter(v => v.categoria.id === id));
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

  openVideo(video: Video): void { this.videoAtivo.set(video); }
  closeVideo(): void { this.videoAtivo.set(null); }

  openModal(): void { this.form = { titulo: '', linkYoutube: '', descricao: '', idCategoria: 1, idTurma: this.turmas()[0]?.id || 0 }; this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); }

  saveVideo(): void {
    this.apiService.createVideo(this.form).subscribe(() => { this.closeModal(); this.loadVideos(); });
  }
}
