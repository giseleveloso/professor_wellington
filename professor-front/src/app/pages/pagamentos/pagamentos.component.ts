import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Pagamento } from '../../core/models/user.model';

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

    <div class="card">
      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
        </div>
      } @else if (pagamentos().length === 0) {
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
              @for (pag of pagamentos(); track pag.id) {
                <tr>
                  @if (authService.isProfessor()) {
                    <td class="font-medium">{{ pag.nomeAluno }}</td>
                  }
                  <td>{{ pag.mesReferencia }}/{{ pag.anoReferencia }}</td>
                  <td class="font-semibold">{{ formatCurrency(pag.valor) }}</td>
                  <td>{{ formatDate(pag.dataVencimento) }}</td>
                  <td>
                    <span [class]="'badge badge-' + getStatusClass(pag.status)">
                      {{ pag.status.label }}
                    </span>
                  </td>
                  @if (authService.isProfessor()) {
                    <td>
                      @if (pag.status.id !== 2) {
                        <button class="btn btn-success btn-sm" (click)="marcarPago(pag.id)">
                          ✓ Pago
                        </button>
                      } @else {
                        <span class="text-muted">{{ formatDate(pag.dataPagamento) }}</span>
                      }
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
                <label class="form-label">Mês</label>
                <select class="form-control" [(ngModel)]="form.mesReferencia" name="mesReferencia">
                  @for (mes of meses; track mes) {
                    <option [value]="mes">{{ mes }}</option>
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
                <label class="form-label">Valor</label>
                <input type="number" class="form-control" [(ngModel)]="form.valor" name="valor" step="0.01" required />
              </div>
              <div class="form-group">
                <label class="form-label">Vencimento</label>
                <input type="date" class="form-control" [(ngModel)]="form.dataVencimento" name="dataVencimento" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar</button>
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
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } }
  `]
})
export class PagamentosComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  pagamentos = signal<Pagamento[]>([]);
  alunos = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);

  meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  form = { idAluno: 0, mesReferencia: '', anoReferencia: 2026, valor: 350, dataVencimento: '', idStatus: 1 };

  ngOnInit(): void {
    this.loadPagamentos();
    if (this.authService.isProfessor()) {
      this.apiService.getAlunos().subscribe(a => this.alunos.set(a));
    }
  }

  loadPagamentos(): void {
    this.loading.set(true);
    this.apiService.getPagamentos().subscribe({
      next: p => { this.pagamentos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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

  openModal(): void {
    const now = new Date();
    this.form = {
      idAluno: this.alunos()[0]?.id || 0,
      mesReferencia: this.meses[now.getMonth()],
      anoReferencia: now.getFullYear(),
      valor: 350,
      dataVencimento: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`,
      idStatus: 1
    };
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  savePagamento(): void {
    this.apiService.createPagamento(this.form).subscribe(() => {
      this.closeModal();
      this.loadPagamentos();
    });
  }
}
