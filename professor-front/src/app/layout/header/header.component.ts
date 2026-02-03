import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Professor, Aluno } from '../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <img src="assets/images/logo-img.png" alt="ClassHub" class="header-logo" />
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="header-right">
        <button class="notification-btn">
          <span>🔔</span>
        </button>

        <div class="user-menu" (click)="openProfileModal()">
          <div class="avatar">
            {{ authService.getInitials() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authService.getUserName() }}</span>
            <span class="user-role">{{ authService.isProfessor() ? 'Professor' : 'Aluno' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Modal de Perfil -->
    @if (showProfileModal()) {
      <div class="modal-overlay" (click)="closeProfileModal()">
        <div class="modal modal-profile" (click)="$event.stopPropagation()">
          <div class="modal-header profile-header">
            <div class="profile-header-content">
              <div class="avatar avatar-xl">{{ authService.getInitials() }}</div>
              <div class="profile-header-info">
                <h3>{{ userData()?.nome }}</h3>
                <p class="text-muted">{{ userData()?.email }}</p>
              </div>
            </div>
            <button class="btn btn-icon" (click)="closeProfileModal()">✕</button>
          </div>

          <div class="modal-body profile-body">
            @if (loadingProfile()) {
              <div class="loading-state">
                <span class="spinner"></span>
                <p>Carregando dados...</p>
              </div>
            } @else if (userData()) {
              @if (!editMode()) {
                <!-- Modo de visualização -->
                <div class="profile-section">
                  <h4 class="section-title">Informações Pessoais</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Nome</span>
                      <span class="info-value">{{ userData()?.nome }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email</span>
                      <span class="info-value">{{ userData()?.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Username</span>
                      <span class="info-value">{{ userData()?.username }}</span>
                    </div>
                    @if (userData()?.telefone) {
                      <div class="info-item">
                        <span class="info-label">Telefone</span>
                        <span class="info-value">({{ userData()?.telefone?.codigoArea }}) {{ userData()?.telefone?.numero }}</span>
                      </div>
                    }
                    @if (hasDataNascimento()) {
                      <div class="info-item">
                        <span class="info-label">Data de Nascimento</span>
                        <span class="info-value">{{ getFormattedDataNascimento() }}</span>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <!-- Modo de edição -->
                <div class="profile-section">
                  <h4 class="section-title">Editar Informações</h4>
                  <form class="edit-form">
                    <div class="form-group">
                      <label class="form-label">Nome</label>
                      <input type="text" class="form-control" [(ngModel)]="editForm.nome" name="nome" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" [(ngModel)]="editForm.email" name="email" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Username</label>
                      <input type="text" class="form-control" [(ngModel)]="editForm.username" name="username" required />
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">DDD</label>
                        <input type="text" class="form-control" [(ngModel)]="editForm.telefone.codigoArea" name="codigoArea" maxlength="2" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Telefone</label>
                        <input type="text" class="form-control" [(ngModel)]="editForm.telefone.numero" name="numero" />
                      </div>
                    </div>
                    @if (authService.isAluno()) {
                      <div class="form-group">
                        <label class="form-label">Data de Nascimento</label>
                        <input type="date" class="form-control" [(ngModel)]="editForm.dataNascimento" name="dataNascimento" />
                      </div>
                    }
                    <div class="form-group">
                      <label class="form-label">Nova Senha (deixe em branco para não alterar)</label>
                      <input type="password" class="form-control" [(ngModel)]="editForm.senha" name="senha" />
                    </div>
                  </form>
                </div>
              }
            }
          </div>

          <div class="modal-footer">
            @if (!editMode()) {
              <button class="btn btn-secondary" (click)="closeProfileModal()">Fechar</button>
              <button class="btn btn-primary" (click)="enableEditMode()">Editar</button>
              <button class="btn btn-secondary" (click)="authService.logout()">Sair</button>
            } @else {
              <button class="btn btn-secondary" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-primary" (click)="saveProfile()" [disabled]="savingProfile()">
                {{ savingProfile() ? 'Salvando...' : 'Salvar' }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--white);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-800);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--gray-50);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-100);
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--gray-50);
      }
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--gray-800);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    @media (max-width: 768px) {
      .user-info {
        display: none;
      }
    }

    /* Modal Styles */
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
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .profile-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--white);
      border-bottom: none;
    }

    .profile-header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar-xl {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.5rem;
    }

    .profile-header-info h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--white);
    }

    .profile-header-info .text-muted {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: var(--white);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.25rem;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .profile-section {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
    }

    .info-value {
      font-size: 0.875rem;
      color: var(--gray-800);
      font-weight: 500;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-200);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-sm);
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .btn-secondary {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .btn-secondary:hover {
      background: var(--gray-200);
    }

    .btn-primary {
      background: var(--primary);
      color: var(--white);
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 1rem;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--gray-600);
    }

    .form-control {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
    }
  `]
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  showProfileModal = signal(false);
  userData = signal<Professor | Aluno | null>(null);
  loadingProfile = signal(false);
  editMode = signal(false);
  savingProfile = signal(false);

  editForm = {
    nome: '',
    email: '',
    username: '',
    telefone: { codigoArea: '', numero: '' },
    dataNascimento: '',
    senha: ''
  };

  openProfileModal(): void {
    this.showProfileModal.set(true);
    this.loadingProfile.set(true);

    if (this.authService.isProfessor()) {
      this.apiService.getCurrentProfessor().subscribe({
        next: (professor) => {
          this.userData.set(professor);
          this.loadingProfile.set(false);
        },
        error: () => {
          this.loadingProfile.set(false);
          alert('Erro ao carregar dados');
        }
      });
    } else if (this.authService.isAluno()) {
      this.apiService.getCurrentAluno().subscribe({
        next: (aluno) => {
          this.userData.set(aluno);
          this.loadingProfile.set(false);
        },
        error: () => {
          this.loadingProfile.set(false);
          alert('Erro ao carregar dados');
        }
      });
    }
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
    this.editMode.set(false);
  }

  enableEditMode(): void {
    const user = this.userData();
    if (!user) return;

    this.editForm = {
      nome: user.nome,
      email: user.email,
      username: user.username,
      telefone: {
        codigoArea: user.telefone?.codigoArea || '',
        numero: user.telefone?.numero || ''
      },
      dataNascimento: (user as any).dataNascimento || '',
      senha: ''
    };
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  hasDataNascimento(): boolean {
    const user = this.userData();
    return this.authService.isAluno() && !!(user as Aluno)?.dataNascimento;
  }

  getFormattedDataNascimento(): string {
    const user = this.userData();
    if (!user) return '';
    const dataNascimento = (user as Aluno)?.dataNascimento;
    return dataNascimento ? this.formatDate(dataNascimento) : '';
  }

  saveProfile(): void {
    const user = this.userData();
    if (!user) return;

    this.savingProfile.set(true);

    if (this.authService.isProfessor()) {
      this.saveProfessorProfile(user as Professor);
    } else if (this.authService.isAluno()) {
      this.saveAlunoProfile(user as Aluno);
    }
  }

  private saveProfessorProfile(professor: Professor): void {
    // Usa username atual para não dar erro de validação
    const updateData = {
      nome: this.editForm.nome,
      email: this.editForm.email,
      username: professor.username,
      senha: 'senha_nao_sera_alterada_pelo_update',
      telefone: this.editForm.telefone.numero ? {
        codigoArea: this.editForm.telefone.codigoArea,
        numero: this.editForm.telefone.numero
      } : null
    };

    this.apiService.updateProfessor(professor.id, updateData).subscribe({
      next: (updated) => {
        // Atualizar username se mudou
        if (this.editForm.username !== professor.username) {
          this.apiService.updateProfessorUsername(professor.id, this.editForm.username).subscribe({
            next: () => {
              // Atualizar senha se fornecida
              if (this.editForm.senha) {
                this.updateProfessorPassword(professor.id, updated);
              } else {
                this.finishUpdate(updated);
              }
            },
            error: () => {
              this.savingProfile.set(false);
              alert('Erro ao atualizar username');
            }
          });
        } else if (this.editForm.senha) {
          // Só atualizar senha se fornecida
          this.updateProfessorPassword(professor.id, updated);
        } else {
          this.finishUpdate(updated);
        }
      },
      error: () => {
        this.savingProfile.set(false);
        alert('Erro ao atualizar dados');
      }
    });
  }

  private saveAlunoProfile(aluno: Aluno): void {
    // Usa username atual para não dar erro de validação
    const updateData = {
      nome: this.editForm.nome,
      email: this.editForm.email,
      username: aluno.username,
      senha: 'senha_nao_sera_alterada_pelo_update',
      telefone: this.editForm.telefone.numero ? {
        codigoArea: this.editForm.telefone.codigoArea,
        numero: this.editForm.telefone.numero
      } : null,
      dataNascimento: this.editForm.dataNascimento,
      idsTurmas: aluno.turmas?.map(t => t.id) || (aluno.idTurma ? [aluno.idTurma] : [])
    };

    this.apiService.updateAluno(aluno.id, updateData).subscribe({
      next: (updated) => {
        if (this.editForm.username !== aluno.username) {
          this.apiService.updateAlunoUsername(aluno.id, this.editForm.username).subscribe({
            next: () => {
              if (this.editForm.senha) {
                this.updateAlunoPassword(aluno.id, updated);
              } else {
                this.finishUpdate(updated);
              }
            },
            error: () => {
              this.savingProfile.set(false);
              alert('Erro ao atualizar username');
            }
          });
        } else if (this.editForm.senha) {
          this.updateAlunoPassword(aluno.id, updated);
        } else {
          this.finishUpdate(updated);
        }
      },
      error: () => {
        this.savingProfile.set(false);
        alert('Erro ao atualizar dados');
      }
    });
  }

  private updateProfessorPassword(professorId: number, updated: Professor): void {
    this.apiService.updateProfessorPassword(professorId, this.editForm.senha).subscribe({
      next: () => this.finishUpdate(updated),
      error: () => {
        this.savingProfile.set(false);
        alert('Erro ao atualizar senha');
      }
    });
  }

  private updateAlunoPassword(alunoId: number, updated: Aluno): void {
    this.apiService.updateAlunoPassword(alunoId, this.editForm.senha).subscribe({
      next: () => this.finishUpdate(updated),
      error: () => {
        this.savingProfile.set(false);
        alert('Erro ao atualizar senha');
      }
    });
  }

  private finishUpdate(updated: Professor | Aluno): void {
    this.userData.set(updated);
    this.savingProfile.set(false);
    this.editMode.set(false);
    alert('Dados atualizados com sucesso!');
  }
}
