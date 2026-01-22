import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aluno, Turma, Pagamento } from '../../core/models/user.model';

type TabView = 'todos' | 'aniversariantes';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🎓 Gerenciar Alunos</h2>
        <p class="text-muted">Cadastre e gerencie seus alunos</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Novo Aluno
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs-container mb-4">
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'todos'"
        (click)="activeTab = 'todos'"
      >
        👥 Todos os Alunos
      </button>
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'aniversariantes'"
        (click)="activeTab = 'aniversariantes'"
      >
        🎂 Aniversariantes da Semana
        @if (aniversariantesSemana().length > 0) {
          <span class="tab-badge">{{ aniversariantesSemana().length }}</span>
        }
      </button>
    </div>

    <!-- Tab: Todos os Alunos -->
    @if (activeTab === 'todos') {
      <!-- Filtro por Turma -->
      <div class="filters card mb-4">
        <div class="flex items-center gap-4">
          <label class="form-label mb-0">Filtrar por turma:</label>
          <select class="form-control" style="width: auto;" [(ngModel)]="filtroTurma" (change)="filterAlunos()">
            <option [value]="0">Todas as turmas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando alunos...</p>
        </div>
      } @else if (alunosFiltrados().length === 0) {
        <div class="card">
          <div class="empty-state">
            <span class="empty-icon">🎓</span>
            <h3>Nenhum aluno encontrado</h3>
            <p>Cadastre seu primeiro aluno</p>
            <button class="btn btn-primary mt-4" (click)="openModal()">
              Cadastrar Aluno
            </button>
          </div>
        </div>
      } @else {
        <div class="card">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Email</th>
                  <th>Turmas</th>
                  <th>Telefone</th>
                  <th>Nascimento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (aluno of alunosFiltrados(); track aluno.id) {
                  <tr>
                    <td>
                      <div class="flex items-center gap-3 aluno-nome-cell" (click)="openProfileModal(aluno)">
                        <div class="avatar">{{ getInitials(aluno.nome) }}</div>
                        <div>
                          <div class="font-semibold aluno-nome-link">{{ aluno.nome }}</div>
                          <div class="text-muted" style="font-size: 0.75rem;">{{ aluno.username }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ aluno.email }}</td>
                    <td>
                      <div class="turmas-badges">
                        @if (aluno.turmas && aluno.turmas.length > 0) {
                          @for (turma of aluno.turmas; track turma.id) {
                            <span class="badge badge-primary">{{ turma.nome }}</span>
                          }
                        } @else if (aluno.nomeTurma) {
                          <span class="badge badge-primary">{{ aluno.nomeTurma }}</span>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </div>
                    </td>
                    <td>{{ formatTelefone(aluno.telefone) }}</td>
                    <td>{{ formatDataNascimento(aluno.dataNascimento) }}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" (click)="editAluno(aluno)">
                          Editar
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="deleteAluno(aluno.id)">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }

    <!-- Tab: Aniversariantes da Semana -->
    @if (activeTab === 'aniversariantes') {
      <div class="card">
        @if (aniversariantesSemana().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🎂</span>
            <h3>Nenhum aniversariante esta semana</h3>
            <p class="text-muted">Os aniversariantes dos próximos 7 dias aparecerão aqui</p>
          </div>
        } @else {
          <div class="aniversariantes-grid">
            @for (aluno of aniversariantesSemana(); track aluno.id) {
              <div class="aniversariante-card">
                <div class="aniversariante-avatar">
                  <div class="avatar avatar-lg">{{ getInitials(aluno.nome) }}</div>
                  <span class="birthday-icon">🎂</span>
                </div>
                <div class="aniversariante-info">
                  <h4>{{ aluno.nome }}</h4>
                  <p class="aniversariante-data">
                    {{ formatDataAniversario(aluno.dataNascimento) }}
                    <span class="dias-restantes">{{ getDiasRestantes(aluno.dataNascimento) }}</span>
                  </p>
                  <div class="aniversariante-turmas">
                    @if (aluno.turmas && aluno.turmas.length > 0) {
                      @for (turma of aluno.turmas; track turma.id) {
                        <span class="badge badge-primary badge-sm">{{ turma.nome }}</span>
                      }
                    } @else if (aluno.nomeTurma) {
                      <span class="badge badge-primary badge-sm">{{ aluno.nomeTurma }}</span>
                    }
                  </div>
                </div>
                <div class="aniversariante-actions">
                  @if (aluno.telefone) {
                    <a [href]="'https://wa.me/55' + aluno.telefone.codigoArea + aluno.telefone.numero" 
                       target="_blank" class="btn btn-success btn-sm">
                      📱 WhatsApp
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingAluno() ? 'Editar Aluno' : 'Novo Aluno' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveAluno()">
            <div class="form-group">
              <label class="form-label">Nome Completo</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.nome" 
                name="nome"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  [(ngModel)]="form.email" 
                  name="email"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Data de Nascimento</label>
                <input 
                  type="date" 
                  class="form-control" 
                  [(ngModel)]="form.dataNascimento" 
                  name="dataNascimento"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Usuário</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="form.username" 
                  name="username"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Senha</label>
                <input 
                  type="password" 
                  class="form-control" 
                  [(ngModel)]="form.senha" 
                  name="senha"
                  [required]="!editingAluno()"
                  placeholder="{{ editingAluno() ? 'Deixe vazio para manter' : '' }}"
                />
              </div>
            </div>

            <!-- Seleção de Múltiplas Turmas -->
            <div class="form-group">
              <label class="form-label">Turmas</label>
              <p class="text-muted text-sm mb-2">O aluno pode participar de mais de uma turma</p>
              <div class="turmas-selection">
                @for (turma of turmas(); track turma.id) {
                  <label class="turma-checkbox">
                    <input 
                      type="checkbox" 
                      [checked]="isTurmaSelected(turma.id)"
                      (change)="toggleTurma(turma.id)"
                    />
                    <div class="turma-checkbox-content">
                      <span class="turma-name">{{ turma.nome }}</span>
                      <span class="turma-info-small">{{ turma.idioma.label }} • {{ turma.nivelTurma?.codigo || 'Sem nível' }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Telefones -->
            <div class="telefones-section">
              <h4 class="section-title">📱 Telefones</h4>
              
              <!-- Telefone do Aluno -->
              <div class="form-group">
                <label class="form-label">Celular do Aluno</label>
                <div class="telefone-row">
                  <input 
                    type="text" 
                    class="form-control ddd-input" 
                    [(ngModel)]="form.telefone.codigoArea" 
                    name="codigoArea"
                    maxlength="2"
                    placeholder="DDD"
                  />
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="form.telefone.numero" 
                    name="numero"
                    placeholder="Número"
                  />
                </div>
              </div>

              <!-- Telefone do Responsável -->
              <div class="form-group">
                <label class="form-label">Celular do Responsável</label>
                <div class="telefone-row">
                  <input 
                    type="text" 
                    class="form-control ddd-input" 
                    [(ngModel)]="form.telefoneResponsavel.codigoArea" 
                    name="codigoAreaResp"
                    maxlength="2"
                    placeholder="DDD"
                  />
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="form.telefoneResponsavel.numero" 
                    name="numeroResp"
                    placeholder="Número"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || turmasSelecionadas.length === 0">
                {{ editingAluno() ? 'Salvar' : 'Cadastrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Perfil do Aluno -->
    @if (showProfileModal()) {
      <div class="modal-overlay" (click)="closeProfileModal()">
        <div class="modal modal-profile" (click)="$event.stopPropagation()">
          <div class="modal-header profile-header">
            <div class="profile-header-content">
              <div class="avatar avatar-xl">{{ getInitials(selectedAluno()?.nome || '') }}</div>
              <div class="profile-header-info">
                <h3>{{ selectedAluno()?.nome }}</h3>
                <p class="text-muted">{{ selectedAluno()?.email }}</p>
              </div>
            </div>
            <button class="btn btn-icon" (click)="closeProfileModal()">✕</button>
          </div>

          <div class="modal-body profile-body">
            <!-- Tabs do Perfil -->
            <div class="profile-tabs">
              <button
                class="profile-tab"
                [class.active]="profileTab === 'info'"
                (click)="profileTab = 'info'"
              >
                📋 Informações
              </button>
              <button
                class="profile-tab"
                [class.active]="profileTab === 'pagamentos'"
                (click)="profileTab = 'pagamentos'"
              >
                💰 Pagamentos
                @if (pagamentosPendentesCount() > 0) {
                  <span class="tab-badge-alert">{{ pagamentosPendentesCount() }}</span>
                }
              </button>
            </div>

            <!-- Tab: Informações -->
            @if (profileTab === 'info') {
              <div class="profile-section">
                <h4 class="section-title">🎓 Turmas e Horários</h4>
                @if (getAlunoTurmasDetails().length > 0) {
                  @for (turma of getAlunoTurmasDetails(); track turma.id) {
                    <div class="turma-info-block">
                      <div class="turma-info-header">
                        <span class="turma-info-nome">{{ turma.nome }}</span>
                        @if (turma.nivelTurma) {
                          <span class="badge badge-secondary">{{ turma.nivelTurma.codigo }}</span>
                        }
                      </div>
                      <div class="info-grid">
                        <div class="info-card">
                          <span class="info-label">Horário</span>
                          <span class="info-value">{{ turma.horario || '-' }}</span>
                        </div>
                        <div class="info-card">
                          <span class="info-label">Dias</span>
                          <span class="info-value">{{ turma.diasSemana || '-' }}</span>
                        </div>
                      </div>
                    </div>
                  }
                } @else if (selectedAluno()?.nomeTurma) {
                  <div class="info-grid">
                    <div class="info-card">
                      <span class="info-label">Turma</span>
                      <span class="info-value">{{ selectedAluno()!.nomeTurma }}</span>
                    </div>
                  </div>
                } @else {
                  <p class="text-muted">Nenhuma turma associada</p>
                }
              </div>

              <div class="profile-section">
                <h4 class="section-title">👤 Dados Pessoais</h4>
                <div class="info-grid">
                  <div class="info-card">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ selectedAluno()?.email || '-' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Usuário</span>
                    <span class="info-value">{{ selectedAluno()?.username || '-' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Nascimento</span>
                    <span class="info-value">{{ formatDataNascimento(selectedAluno()?.dataNascimento) }}</span>
                  </div>
                </div>
              </div>

              <div class="profile-section">
                <h4 class="section-title">📱 Contatos</h4>
                <div class="info-grid">
                  <div class="info-card">
                    <span class="info-label">Celular do Aluno</span>
                    <span class="info-value">
                      {{ formatTelefone(selectedAluno()?.telefone) }}
                      @if (selectedAluno()?.telefone?.numero) {
                        <a [href]="'https://wa.me/55' + selectedAluno()!.telefone!.codigoArea + selectedAluno()!.telefone!.numero"
                           target="_blank" class="whatsapp-link">📱</a>
                      }
                    </span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Celular do Responsável</span>
                    <span class="info-value">
                      {{ formatTelefone(selectedAluno()?.telefoneResponsavel) }}
                      @if (selectedAluno()?.telefoneResponsavel?.numero) {
                        <a [href]="'https://wa.me/55' + selectedAluno()!.telefoneResponsavel!.codigoArea + selectedAluno()!.telefoneResponsavel!.numero"
                           target="_blank" class="whatsapp-link">📱</a>
                      }
                    </span>
                  </div>
                </div>
              </div>
            }

            <!-- Tab: Pagamentos -->
            @if (profileTab === 'pagamentos') {
              <div class="profile-section">
                <div class="pagamentos-summary">
                  <div class="summary-card summary-pendente">
                    <span class="summary-value">{{ pagamentosPendentesCount() }}</span>
                    <span class="summary-label">Pendentes</span>
                  </div>
                  <div class="summary-card summary-atrasado">
                    <span class="summary-value">{{ pagamentosAtrasadosCount() }}</span>
                    <span class="summary-label">Atrasados</span>
                  </div>
                  <div class="summary-card summary-pago">
                    <span class="summary-value">{{ pagamentosPagosCount() }}</span>
                    <span class="summary-label">Pagos</span>
                  </div>
                </div>

                @if (loadingPagamentos()) {
                  <div class="loading-state">
                    <span class="spinner"></span>
                    <p>Carregando pagamentos...</p>
                  </div>
                } @else if (alunoPagamentos().length === 0) {
                  <div class="empty-state-small">
                    <p>Nenhum pagamento registrado</p>
                  </div>
                } @else {
                  <div class="table-container">
                    <table class="table-compact">
                      <thead>
                        <tr>
                          <th>Referência</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (pag of alunoPagamentos(); track pag.id) {
                          <tr>
                            <td>{{ pag.mesReferencia }}/{{ pag.anoReferencia }}</td>
                            <td>{{ formatDataPagamento(pag.dataVencimento) }}</td>
                            <td class="font-semibold">{{ formatCurrency(pag.valor) }}</td>
                            <td>
                              <span class="status-badge" [class]="'status-' + pag.status.label.toLowerCase()">
                                {{ pag.status.label }}
                              </span>
                            </td>
                            <td>
                              @if (pag.status.label !== 'Pago') {
                                <button class="btn btn-success btn-xs" (click)="marcarComoPago(pag.id)">
                                  ✓ Pagar
                                </button>
                              } @else {
                                <button class="btn btn-outline btn-xs" (click)="marcarComoNaoPago(pag.id)">
                                  ↩ Desfazer
                                </button>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeProfileModal()">Fechar</button>
            <button class="btn btn-primary" (click)="editAluno(selectedAluno()!)">Editar Aluno</button>
          </div>
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
    }

    .tabs-container {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--gray-200);
      padding-bottom: 0;
    }

    .tab-btn {
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        color: var(--gray-800);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    }

    .tab-badge {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
    }

    .filters { padding: 1rem 1.5rem; }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--gray-500);

      .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    }

    .turmas-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    // Aniversariantes
    .aniversariantes-grid {
      display: flex;
      flex-direction: column;
    }

    .aniversariante-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      &:last-child { border-bottom: none; }

      &:hover {
        background: var(--gray-50);
      }
    }

    .aniversariante-avatar {
      position: relative;

      .avatar-lg {
        width: 56px;
        height: 56px;
        font-size: 1.25rem;
      }

      .birthday-icon {
        position: absolute;
        bottom: -4px;
        right: -4px;
        font-size: 1.25rem;
      }
    }

    .aniversariante-info {
      flex: 1;

      h4 { margin-bottom: 0.25rem; }
    }

    .aniversariante-data {
      font-size: 0.875rem;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dias-restantes {
      background: var(--primary-bg);
      color: var(--primary);
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .aniversariante-turmas {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.25rem;
    }

    .badge-sm { font-size: 0.7rem; padding: 0.125rem 0.375rem; }

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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-lg { max-width: 600px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .text-sm { font-size: 0.8125rem; }

    // Telefones Section
    .telefones-section {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-top: 1rem;
    }

    .section-title {
      font-size: 0.9375rem;
      margin-bottom: 1rem;
      color: var(--gray-700);
    }

    .telefone-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 0.5rem;
    }

    .ddd-input { text-align: center; }

    // Turmas Selection
    .turmas-selection {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      padding: 0.5rem;
    }

    .turma-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--gray-50);
        border-color: var(--primary-light);
      }

      &:has(input:checked) {
        background: var(--primary-bg);
        border-color: var(--primary);
      }

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--primary);
      }
    }

    .turma-checkbox-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .turma-name {
      font-weight: 500;
      color: var(--gray-800);
    }

    .turma-info-small {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    // Nome clicável
    .aluno-nome-cell {
      cursor: pointer;
      transition: all 0.2s;
      padding: 0.25rem;
      margin: -0.25rem;
      border-radius: var(--border-radius-sm);

      &:hover {
        background: var(--gray-50);
      }
    }

    .aluno-nome-link {
      color: var(--primary);

      &:hover {
        text-decoration: underline;
      }
    }

    // Profile Modal
    .modal-profile {
      max-width: 700px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .profile-header {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark, #4338ca));
      color: white;
      padding: 1.5rem;
    }

    .profile-header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .profile-header-info {
      h3 {
        color: white;
        margin-bottom: 0.25rem;
      }
      p {
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
      }
    }

    .profile-header .btn-icon {
      color: white;
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .avatar-xl {
      width: 64px;
      height: 64px;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .profile-body {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .profile-tabs {
      display: flex;
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .profile-tab {
      flex: 1;
      padding: 0.875rem 1rem;
      border: none;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      &:hover {
        color: var(--gray-800);
        background: var(--gray-100);
      }

      &.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
        background: white;
      }
    }

    .tab-badge-alert {
      background: var(--danger);
      color: white;
      font-size: 0.7rem;
      padding: 0.125rem 0.4rem;
      border-radius: 10px;
      font-weight: 600;
    }

    .profile-section {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);

      &:last-child {
        border-bottom: none;
      }
    }

    .section-title {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--gray-700);
    }

    .turma-info-block {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .turma-info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .turma-info-nome {
      font-weight: 600;
      color: var(--gray-800);
    }

    .turma-info-block .info-grid {
      background: transparent;
    }

    .turma-info-block .info-card {
      background: white;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .info-card {
      background: var(--gray-50);
      padding: 0.875rem;
      border-radius: var(--border-radius-sm);
    }

    .info-label {
      display: block;
      font-size: 0.75rem;
      color: var(--gray-500);
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-weight: 500;
      color: var(--gray-800);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .whatsapp-link {
      font-size: 1.1rem;
      text-decoration: none;
      opacity: 0.7;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    // Pagamentos Summary
    .pagamentos-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .summary-card {
      padding: 1rem;
      border-radius: var(--border-radius-sm);
      text-align: center;
    }

    .summary-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .summary-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-pendente {
      background: #fef3c7;
      color: #92400e;
    }

    .summary-atrasado {
      background: #fee2e2;
      color: #b91c1c;
    }

    .summary-pago {
      background: #d1fae5;
      color: #065f46;
    }

    // Table compact
    .table-compact {
      font-size: 0.875rem;

      th, td {
        padding: 0.625rem 0.75rem;
      }
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-pendente {
      background: #fef3c7;
      color: #92400e;
    }

    .status-atrasado {
      background: #fee2e2;
      color: #b91c1c;
    }

    .status-pago {
      background: #d1fae5;
      color: #065f46;
    }

    .btn-xs {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .empty-state-small {
      text-align: center;
      padding: 2rem;
      color: var(--gray-500);
    }
  `]
})
export class AlunosComponent implements OnInit {
  private apiService = inject(ApiService);

  alunos = signal<Aluno[]>([]);
  alunosFiltrados = signal<Aluno[]>([]);
  turmas = signal<Turma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingAluno = signal<Aluno | null>(null);
  filtroTurma = 0;
  activeTab: TabView = 'todos';

  // Profile Modal
  showProfileModal = signal(false);
  selectedAluno = signal<Aluno | null>(null);
  alunoPagamentos = signal<Pagamento[]>([]);
  loadingPagamentos = signal(false);
  profileTab: 'info' | 'pagamentos' = 'info';

  pagamentosPendentesCount = computed(() =>
    this.alunoPagamentos().filter(p => p.status.label === 'Pendente').length
  );
  pagamentosAtrasadosCount = computed(() =>
    this.alunoPagamentos().filter(p => p.status.label === 'Atrasado').length
  );
  pagamentosPagosCount = computed(() =>
    this.alunoPagamentos().filter(p => p.status.label === 'Pago').length
  );

  turmasSelecionadas: number[] = [];

  form = {
    nome: '',
    email: '',
    username: '',
    senha: '',
    dataNascimento: '',
    telefone: { codigoArea: '', numero: '' },
    telefoneResponsavel: { codigoArea: '', numero: '' }
  };

  aniversariantesSemana = computed(() => {
    const hoje = new Date();
    const seteDias = new Date();
    seteDias.setDate(hoje.getDate() + 7);

    return this.alunos()
      .filter(a => {
        if (!a.dataNascimento) return false;
        
        const nascimento = new Date(a.dataNascimento + 'T00:00:00');
        const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        
        // Se já passou, verificar ano que vem
        if (aniversarioEsteAno < hoje) {
          aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
        }
        
        return aniversarioEsteAno >= hoje && aniversarioEsteAno <= seteDias;
      })
      .sort((a, b) => {
        const dateA = this.getProximoAniversario(a.dataNascimento!);
        const dateB = this.getProximoAniversario(b.dataNascimento!);
        return dateA.getTime() - dateB.getTime();
      });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
      }
    });

    this.loadAlunos();
  }

  loadAlunos(): void {
    this.loading.set(true);
    this.apiService.getAlunos().subscribe({
      next: (alunos) => {
        this.alunos.set(alunos);
        this.filterAlunos(); // Aplicar filtro após carregar
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterAlunos(): void {
    const turmaId = Number(this.filtroTurma);
    if (turmaId === 0) {
      this.alunosFiltrados.set(this.alunos());
    } else {
      this.alunosFiltrados.set(
        this.alunos().filter(a => {
          if (a.turmas && a.turmas.length > 0) {
            return a.turmas.some(t => t.id === turmaId);
          }
          return a.idTurma === turmaId;
        })
      );
    }
  }

  isTurmaSelected(turmaId: number): boolean {
    return this.turmasSelecionadas.includes(turmaId);
  }

  toggleTurma(turmaId: number): void {
    const index = this.turmasSelecionadas.indexOf(turmaId);
    if (index > -1) {
      this.turmasSelecionadas.splice(index, 1);
    } else {
      this.turmasSelecionadas.push(turmaId);
    }
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  formatTelefone(telefone?: { codigoArea: string; numero: string }): string {
    if (!telefone || !telefone.numero) return '-';
    return `(${telefone.codigoArea}) ${telefone.numero}`;
  }

  formatDataNascimento(data?: string): string {
    if (!data) return '-';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  formatDataAniversario(data?: string): string {
    if (!data) return '-';
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  }

  getProximoAniversario(dataNascimento: string): Date {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento + 'T00:00:00');
    const aniversario = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
    
    if (aniversario < hoje) {
      aniversario.setFullYear(hoje.getFullYear() + 1);
    }
    
    return aniversario;
  }

  getDiasRestantes(dataNascimento?: string): string {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const aniversario = this.getProximoAniversario(dataNascimento);
    
    const diffTime = aniversario.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '🎉 Hoje!';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays} dias`;
  }

  openModal(): void {
    this.editingAluno.set(null);
    this.form = {
      nome: '',
      email: '',
      username: '',
      senha: '',
      dataNascimento: '',
      telefone: { codigoArea: '', numero: '' },
      telefoneResponsavel: { codigoArea: '', numero: '' }
    };
    this.turmasSelecionadas = this.turmas().length > 0 ? [this.turmas()[0].id] : [];
    this.showModal.set(true);
  }

  editAluno(aluno: Aluno): void {
    // Fechar modal de perfil se estiver aberto
    if (this.showProfileModal()) {
      this.closeProfileModal();
    }

    this.editingAluno.set(aluno);
    this.form = {
      nome: aluno.nome,
      email: aluno.email,
      username: aluno.username,
      senha: '',
      dataNascimento: aluno.dataNascimento || '',
      telefone: aluno.telefone || { codigoArea: '', numero: '' },
      telefoneResponsavel: aluno.telefoneResponsavel || { codigoArea: '', numero: '' }
    };

    if (aluno.turmas && aluno.turmas.length > 0) {
      this.turmasSelecionadas = aluno.turmas.map(t => t.id);
    } else if (aluno.idTurma) {
      this.turmasSelecionadas = [aluno.idTurma];
    } else {
      this.turmasSelecionadas = [];
    }

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAluno(): void {
    this.saving.set(true);
    
    const data: any = { ...this.form };
    
    if (this.turmasSelecionadas.length === 1) {
      data.idTurma = this.turmasSelecionadas[0];
    }
    data.idsTurmas = this.turmasSelecionadas;

    if (this.editingAluno()) {
      this.apiService.updateAluno(this.editingAluno()!.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAlunos();
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.apiService.createAluno(data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAlunos();
        },
        error: () => this.saving.set(false)
      });
    }
  }

  deleteAluno(id: number): void {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      this.apiService.deleteAluno(id).subscribe({
        next: () => this.loadAlunos()
      });
    }
  }

  // ==================== PROFILE MODAL ====================

  openProfileModal(aluno: Aluno): void {
    this.selectedAluno.set(aluno);
    this.profileTab = 'info';
    this.alunoPagamentos.set([]);
    this.showProfileModal.set(true);
    this.loadAlunoPagamentos(aluno.id);
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
    this.selectedAluno.set(null);
  }

  loadAlunoPagamentos(alunoId: number): void {
    this.loadingPagamentos.set(true);
    this.apiService.getPagamentosByAluno(alunoId).subscribe({
      next: (pagamentos) => {
        this.alunoPagamentos.set(pagamentos);
        this.loadingPagamentos.set(false);
      },
      error: () => this.loadingPagamentos.set(false)
    });
  }

  getAlunoTurmasDetails(): Turma[] {
    const aluno = this.selectedAluno();
    if (!aluno) return [];

    const todasTurmas = this.turmas();

    // Buscar todas as turmas do aluno
    if (aluno.turmas && aluno.turmas.length > 0) {
      return aluno.turmas
        .map(t => todasTurmas.find(turma => turma.id === t.id))
        .filter((t): t is Turma => t !== undefined);
    }

    // Fallback para idTurma único
    if (aluno.idTurma) {
      const turma = todasTurmas.find(t => t.id === aluno.idTurma);
      return turma ? [turma] : [];
    }

    return [];
  }

  getTurmaDetails(): Turma | null {
    const turmas = this.getAlunoTurmasDetails();
    return turmas.length > 0 ? turmas[0] : null;
  }

  formatDataPagamento(data?: string): string {
    if (!data) return '-';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  marcarComoPago(id: number): void {
    this.apiService.marcarComoPago(id).subscribe({
      next: () => {
        const aluno = this.selectedAluno();
        if (aluno) this.loadAlunoPagamentos(aluno.id);
      }
    });
  }

  marcarComoNaoPago(id: number): void {
    this.apiService.marcarComoNaoPago(id).subscribe({
      next: () => {
        const aluno = this.selectedAluno();
        if (aluno) this.loadAlunoPagamentos(aluno.id);
      }
    });
  }
}
