import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Pagamento, Aluno } from '../../core/models/user.model';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>💰 Pagamentos</h2>
        <p class="text-muted">Gerencie os pagamentos dos alunos</p>
      </div>
      @if (authService.isProfessor()) {
        <button class="btn btn-primary" (click)="openModal()">
          + Novo Pagamento
        </button>
      }
    </div>

    <!-- Stats Cards -->
    @if (authService.isProfessor()) {
      <div class="stats-row mb-4">
        <div class="stat-card">
          <div class="stat-card-icon success">💵</div>
          <div class="stat-card-value">{{ formatCurrency(totalPago()) }}</div>
          <div class="stat-card-label">Recebido este mês</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon warning">⏳</div>
          <div class="stat-card-value">{{ formatCurrency(totalPendente()) }}</div>
          <div class="stat-card-label">Pendente</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon danger">⚠️</div>
          <div class="stat-card-value">{{ totalAtrasado() }}</div>
          <div class="stat-card-label">Atrasados</div>
        </div>
      </div>
    }

    <!-- Filtros -->
    @if (authService.isProfessor()) {
      <div class="card mb-4 p-3">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="form-group mb-0" style="min-width: 150px;">
            <label class="form-label mb-1">Status</label>
            <select class="form-control" [(ngModel)]="filtroStatus" (change)="aplicarFiltros()">
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagos</option>
              <option value="atrasado">Atrasados</option>
            </select>
          </div>
          <div class="form-group mb-0" style="min-width: 150px;">
            <label class="form-label mb-1">Aluno</label>
            <select class="form-control" [(ngModel)]="filtroAluno" (change)="aplicarFiltros()">
              <option value="0">Todos</option>
              @for (aluno of alunos(); track aluno.id) {
                <option [value]="aluno.id">{{ aluno.nome }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    }

    <div class="card">
      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
        </div>
      } @else if (pagamentosFiltrados().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">💳</span>
          <h3>Nenhum pagamento encontrado</h3>
        </div>
      } @else {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                @if (authService.isProfessor()) {
                  <th>Aluno</th>
                }
                <th>Referência</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                @if (authService.isProfessor()) {
                  <th>Ações</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (pag of pagamentosFiltrados(); track pag.id) {
                <tr>
                  @if (authService.isProfessor()) {
                    <td class="font-medium">{{ pag.nomeAluno }}</td>
                  }
                  <td>{{ pag.mesReferencia }}/{{ pag.anoReferencia }}</td>
                  <td class="font-semibold">{{ formatCurrency(pag.valor) }}</td>
                  <td>{{ formatDate(pag.dataVencimento) }}</td>
                  <td>
                    <span [class]="'badge badge-' + getStatusClass(pag.status)">
                      {{ pag.status.label || 'Pendente' }}
                    </span>
                  </td>
                  @if (authService.isProfessor()) {
                    <td>
                      <div class="flex gap-2 items-center">
                        @if (pag.status.id !== 2) {
                          <button class="btn btn-success btn-sm" (click)="marcarPago(pag.id)">
                            ✓ Pago
                          </button>
                        } @else {
                          <div class="pago-info">
                            <span class="text-muted">{{ formatDate(pag.dataPagamento) }}</span>
                            <button class="btn btn-outline btn-xs" (click)="marcarNaoPago(pag.id)" title="Desfazer pagamento">
                              ↩️
                            </button>
                          </div>
                        }
                        <button class="btn btn-danger btn-xs" (click)="deletePagamento(pag.id)" title="Excluir pagamento">
                          🗑️
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal Novo Pagamento -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Novo Pagamento</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-body" (ngSubmit)="savePagamento()">
            <div class="form-group">
              <label class="form-label">Aluno</label>
              <select class="form-control" [(ngModel)]="form.idAluno" name="idAluno" required>
                @for (aluno of alunos(); track aluno.id) {
                  <option [value]="aluno.id">{{ aluno.nome }}</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Mês Inicial</label>
                <select class="form-control" [(ngModel)]="form.mesReferencia" name="mesReferencia">
                  @for (mes of meses; track mes.nome; let i = $index) {
                    <option [value]="mes.nome">{{ mes.nome }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ano</label>
                <input type="number" class="form-control" [(ngModel)]="form.anoReferencia" name="anoReferencia" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Valor Mensal</label>
                <input type="number" class="form-control" [(ngModel)]="form.valor" name="valor" step="0.01" required />
              </div>
              <div class="form-group">
                <label class="form-label">Dia Vencimento</label>
                <input type="number" class="form-control" [(ngModel)]="diaVencimento" name="diaVencimento" 
                  min="1" max="28" placeholder="15" />
              </div>
            </div>

            <!-- Opção de Recorrência -->
            <div class="recurrence-section">
              <div class="form-group">
                <label class="checkbox-container">
                  <input type="checkbox" [(ngModel)]="repetirCobranca" name="repetirCobranca" />
                  <span class="checkmark"></span>
                  🔄 Repetir cobrança automaticamente
                </label>
              </div>

              @if (repetirCobranca) {
                <div class="recurrence-options">
                  <div class="form-group">
                    <label class="form-label">Repetir por quantos meses?</label>
                    <div class="btn-group-select">
                      @for (qty of [3, 6, 12]; track qty) {
                        <button 
                          type="button"
                          class="btn-select"
                          [class.active]="mesesRepetir === qty"
                          (click)="mesesRepetir = qty"
                        >
                          {{ qty }} meses
                        </button>
                      }
                    </div>
                  </div>

                  <div class="recurrence-preview">
                    <div class="preview-header">
                      <span>📋 Cobranças que serão criadas:</span>
                    </div>
                    <div class="preview-list">
                      @for (preview of previewRecorrencia(); track preview.mes) {
                        <div class="preview-item">
                          <span>{{ preview.mes }}/{{ preview.ano }}</span>
                          <span>{{ formatCurrency(form.valor) }}</span>
                          <span class="text-muted">venc. dia {{ diaVencimento }}</span>
                        </div>
                      }
                    </div>
                    <div class="preview-total">
                      <strong>Total: {{ formatCurrency(form.valor * mesesRepetir) }}</strong>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                @if (repetirCobranca) {
                  Criar {{ mesesRepetir }} Cobranças
                } @else {
                  Registrar
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    .loading-state, .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    // Checkbox customizado
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      
      input { display: none; }
    }
    
    .checkmark {
      width: 20px;
      height: 20px;
      border: 2px solid var(--gray-300);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &::after {
        content: '✓';
        color: white;
        font-size: 12px;
        opacity: 0;
      }
    }

    .checkbox-container input:checked + .checkmark {
      background: var(--primary);
      border-color: var(--primary);
      
      &::after { opacity: 1; }
    }

    // Recurrence section
    .recurrence-section {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-top: 1rem;
    }

    .recurrence-options { margin-top: 1rem; }

    .btn-group-select {
      display: flex;
      gap: 0.5rem;
    }

    .btn-select {
      flex: 1;
      padding: 0.5rem 1rem;
      border: 2px solid var(--gray-200);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-light);
      }

      &.active {
        border-color: var(--primary);
        background: var(--primary-bg);
        color: var(--primary);
        font-weight: 600;
      }
    }

    .recurrence-preview {
      margin-top: 1rem;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
    }

    .preview-header {
      padding: 0.75rem 1rem;
      background: var(--gray-100);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .preview-list {
      max-height: 150px;
      overflow-y: auto;
    }

    .preview-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      border-bottom: 1px solid var(--gray-100);

      &:last-child { border-bottom: none; }
    }

    .preview-total {
      padding: 0.75rem 1rem;
      background: var(--primary-bg);
      text-align: right;
      color: var(--primary);
    }

    .pago-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-xs {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) { 
      .stats-row { grid-template-columns: 1fr; } 
      .btn-group-select { flex-direction: column; }
    }
  `]
})
export class PagamentosComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  pagamentos = signal<Pagamento[]>([]);
  alunos = signal<Aluno[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);

  filtroStatus = 'todos';
  filtroAluno = '0';

  meses = [
    { nome: 'Janeiro', num: 1 },
    { nome: 'Fevereiro', num: 2 },
    { nome: 'Março', num: 3 },
    { nome: 'Abril', num: 4 },
    { nome: 'Maio', num: 5 },
    { nome: 'Junho', num: 6 },
    { nome: 'Julho', num: 7 },
    { nome: 'Agosto', num: 8 },
    { nome: 'Setembro', num: 9 },
    { nome: 'Outubro', num: 10 },
    { nome: 'Novembro', num: 11 },
    { nome: 'Dezembro', num: 12 }
  ];

  form = { idAluno: 0, mesReferencia: '', anoReferencia: 2026, valor: 350, dataVencimento: '', idStatus: 1 };
  diaVencimento = 15;
  repetirCobranca = false;
  mesesRepetir = 6;

  pagamentosFiltrados = computed(() => {
    let result = this.pagamentos();

    if (this.filtroStatus !== 'todos') {
      result = result.filter(p => {
        if (this.filtroStatus === 'pendente') return p.status.id === 1;
        if (this.filtroStatus === 'pago') return p.status.id === 2;
        if (this.filtroStatus === 'atrasado') return p.status.id === 3;
        return true;
      });
    }

    if (this.filtroAluno !== '0') {
      result = result.filter(p => p.idAluno === parseInt(this.filtroAluno));
    }

    return result;
  });

  previewRecorrencia = computed(() => {
    const previews: { mes: string; ano: number }[] = [];
    const mesAtual = this.meses.findIndex(m => m.nome === this.form.mesReferencia);

    if (mesAtual === -1) return previews;

    let mes = mesAtual;
    let ano = this.form.anoReferencia;

    for (let i = 0; i < this.mesesRepetir; i++) {
      previews.push({ mes: this.meses[mes].nome, ano });
      mes++;
      if (mes >= 12) {
        mes = 0;
        ano++;
      }
    }

    return previews;
  });

  ngOnInit(): void {
    this.loadPagamentos();
    if (this.authService.isProfessor()) {
      this.apiService.getAlunos().subscribe(a => this.alunos.set(a));
    }
  }

  loadPagamentos(): void {
    this.loading.set(true);

    // Usar endpoint diferente baseado no perfil
    const request = this.authService.isProfessor()
      ? this.apiService.getPagamentos()
      : this.apiService.getMeusPagamentos();

    request.subscribe({
      next: p => { this.pagamentos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  aplicarFiltros(): void {
    // Trigger computed recalculation by forcing update
    this.pagamentos.update(p => [...p]);
  }

  totalPago = () => this.pagamentos().filter(p => p.status.id === 2).reduce((a, p) => a + p.valor, 0);
  totalPendente = () => this.pagamentos().filter(p => p.status.id === 1).reduce((a, p) => a + p.valor, 0);
  totalAtrasado = () => this.pagamentos().filter(p => p.status.id === 3).length;

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  getStatusClass(s: any): string {
    return s.id === 1 ? 'warning' : s.id === 2 ? 'success' : 'danger';
  }

  marcarPago(id: number): void {
    this.apiService.marcarComoPago(id).subscribe(() => this.loadPagamentos());
  }

  marcarNaoPago(id: number): void {
    if (confirm('Deseja desfazer este pagamento e marcá-lo como pendente?')) {
      this.apiService.marcarComoNaoPago(id).subscribe({
        next: () => this.loadPagamentos(),
        error: () => alert('Erro ao desfazer pagamento')
      });
    }
  }

  deletePagamento(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.')) {
      this.apiService.deletePagamento(id).subscribe({
        next: () => this.loadPagamentos(),
        error: () => alert('Erro ao excluir pagamento')
      });
    }
  }

  openModal(): void {
    const now = new Date();
    this.form = {
      idAluno: this.alunos()[0]?.id || 0,
      mesReferencia: this.meses[now.getMonth()].nome,
      anoReferencia: now.getFullYear(),
      valor: 350,
      dataVencimento: '',
      idStatus: 1
    };
    this.diaVencimento = 15;
    this.repetirCobranca = false;
    this.mesesRepetir = 6;
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  savePagamento(): void {
    this.saving.set(true);

    if (this.repetirCobranca) {
      // Criar múltiplos pagamentos
      const previews = this.previewRecorrencia();
      let completed = 0;

      previews.forEach(preview => {
        const mesNum = this.meses.findIndex(m => m.nome === preview.mes) + 1;
        const dataVencimento = `${preview.ano}-${String(mesNum).padStart(2, '0')}-${String(this.diaVencimento).padStart(2, '0')}`;

        const pagamento = {
          idAluno: this.form.idAluno,
          mesReferencia: preview.mes,
          anoReferencia: preview.ano,
          valor: this.form.valor,
          dataVencimento,
          idStatus: 1
        };

        this.apiService.createPagamento(pagamento).subscribe({
          next: () => {
            completed++;
            if (completed === previews.length) {
              this.saving.set(false);
              this.closeModal();
              this.loadPagamentos();
            }
          },
          error: () => {
            completed++;
            if (completed === previews.length) {
              this.saving.set(false);
            }
          }
        });
      });
    } else {
      // Criar pagamento único
      const mesNum = this.meses.findIndex(m => m.nome === this.form.mesReferencia) + 1;
      this.form.dataVencimento = `${this.form.anoReferencia}-${String(mesNum).padStart(2, '0')}-${String(this.diaVencimento).padStart(2, '0')}`;

      this.apiService.createPagamento(this.form).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadPagamentos();
        },
        error: () => this.saving.set(false)
      });
    }
  }
}
