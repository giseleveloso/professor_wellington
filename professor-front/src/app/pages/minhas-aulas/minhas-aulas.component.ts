import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aula, Turma } from '../../core/models/user.model';

interface DiaCalendario {
  data: Date;
  diaAtual: boolean;
  mesAtual: boolean;
  aulas: Aula[];
}

@Component({
  selector: 'app-minhas-aulas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Minhas Aulas</h2>
          <p class="text-muted">Visualize o calendário das suas aulas</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando aulas...</p>
        </div>
      } @else {
        <!-- Minhas Turmas -->
        <div class="turmas-info">
          <h4>Minhas Turmas</h4>
          <div class="turmas-chips">
            @for (turma of turmas(); track turma.id) {
              <div class="turma-chip" [style.border-color]="turma.cor">
                <span class="turma-cor" [style.background]="turma.cor"></span>
                <div class="turma-chip-info">
                  <span class="turma-nome">{{ turma.nome }}</span>
                  <span class="turma-horario">{{ turma.diasSemana }} - {{ turma.horario }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Calendário -->
        <div class="calendario-container">
          <div class="calendario-header">
            <button class="btn btn-icon" (click)="mesAnterior()">←</button>
            <h3>{{ getNomeMes() }} {{ anoAtual }}</h3>
            <button class="btn btn-icon" (click)="proximoMes()">→</button>
          </div>

          <div class="calendario-grid">
            <div class="dia-semana">Dom</div>
            <div class="dia-semana">Seg</div>
            <div class="dia-semana">Ter</div>
            <div class="dia-semana">Qua</div>
            <div class="dia-semana">Qui</div>
            <div class="dia-semana">Sex</div>
            <div class="dia-semana">Sáb</div>

            @for (dia of diasCalendario(); track dia.data.toISOString()) {
              <div
                class="dia-cell"
                [class.outro-mes]="!dia.mesAtual"
                [class.hoje]="dia.diaAtual"
                [class.tem-aula]="dia.aulas.length > 0"
                (click)="dia.aulas.length > 0 && abrirDetalheDia(dia)"
              >
                <span class="dia-numero">{{ dia.data.getDate() }}</span>
                @if (dia.aulas.length > 0) {
                  <div class="aulas-preview">
                    @for (aula of dia.aulas.slice(0, 2); track aula.id) {
                      <div class="aula-dot" [style.background]="getCorTurma(aula.idTurma)"></div>
                    }
                    @if (dia.aulas.length > 2) {
                      <span class="mais-aulas">+{{ dia.aulas.length - 2 }}</span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Próximas Aulas -->
        <div class="card mt-6">
          <div class="card-header">
            <h4 class="card-title">Próximas Aulas</h4>
          </div>

          @if (proximasAulas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📅</span>
              <p>Nenhuma aula agendada</p>
            </div>
          } @else {
            <div class="aulas-list">
              @for (aula of proximasAulas(); track aula.id) {
                <div class="aula-item">
                  <div class="aula-data">
                    <span class="data-dia">{{ getDiaAula(aula.data) }}</span>
                    <span class="data-mes">{{ getMesAula(aula.data) }}</span>
                  </div>
                  <div class="aula-cor" [style.background]="getCorTurma(aula.idTurma)"></div>
                  <div class="aula-info">
                    <span class="aula-turma">{{ aula.nomeTurma }}</span>
                    <span class="aula-topico">{{ aula.topico }}</span>
                    <span class="aula-horario">{{ aula.horaInicio }} - {{ aula.horaFim }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Modal de Detalhe do Dia -->
      @if (showDiaModal()) {
        <div class="modal-overlay" (click)="closeDiaModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Aulas do dia {{ formatDataModal() }}</h3>
              <button class="btn btn-icon" (click)="closeDiaModal()">✕</button>
            </div>
            <div class="modal-body">
              @for (aula of diaSelecionado()?.aulas; track aula.id) {
                <div class="aula-detail-card">
                  <div class="aula-detail-header">
                    <div class="aula-detail-turma" [style.border-left-color]="getCorTurma(aula.idTurma)">
                      {{ aula.nomeTurma }}
                    </div>
                    <span class="aula-detail-horario">{{ aula.horaInicio }} - {{ aula.horaFim }}</span>
                  </div>
                  <div class="aula-detail-topico">{{ aula.topico }}</div>
                  @if (aula.descricao) {
                    <div class="aula-detail-descricao">{{ aula.descricao }}</div>
                  }
                </div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeDiaModal()">Fechar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;

      h2 {
        margin-bottom: 0.25rem;
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // Turmas Info
    .turmas-info {
      margin-bottom: 1.5rem;

      h4 {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.75rem;
      }
    }

    .turmas-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .turma-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--white);
      padding: 0.75rem 1rem;
      border-radius: var(--border-radius-sm);
      border: 2px solid;
      box-shadow: var(--shadow-sm);
    }

    .turma-cor {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .turma-chip-info {
      display: flex;
      flex-direction: column;
    }

    .turma-nome {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--gray-800);
    }

    .turma-horario {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    // Calendário
    .calendario-container {
      background: var(--white);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);
      overflow: hidden;
    }

    .calendario-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);

      h3 {
        font-size: 1.125rem;
        margin: 0;
      }
    }

    .calendario-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .dia-semana {
      padding: 0.75rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-100);
    }

    .dia-cell {
      min-height: 80px;
      padding: 0.5rem;
      border-right: 1px solid var(--gray-100);
      border-bottom: 1px solid var(--gray-100);
      cursor: default;
      transition: background 0.2s;

      &:nth-child(7n) {
        border-right: none;
      }

      &.outro-mes {
        background: var(--gray-50);

        .dia-numero {
          color: var(--gray-400);
        }
      }

      &.hoje {
        background: var(--primary-bg);

        .dia-numero {
          background: var(--primary);
          color: var(--white);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      &.tem-aula {
        cursor: pointer;

        &:hover {
          background: var(--gray-50);
        }
      }
    }

    .dia-numero {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
    }

    .aulas-preview {
      display: flex;
      gap: 0.25rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .aula-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .mais-aulas {
      font-size: 0.625rem;
      color: var(--gray-500);
    }

    // Card
    .card {
      background: var(--white);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--gray-100);
      overflow: hidden;
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    // Próximas Aulas
    .aulas-list {
      padding: 0.5rem 0;
    }

    .aula-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-50);
      transition: background 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--gray-50);
      }
    }

    .aula-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
    }

    .data-dia {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-800);
      line-height: 1;
    }

    .data-mes {
      font-size: 0.6875rem;
      text-transform: uppercase;
      color: var(--gray-500);
      letter-spacing: 0.05em;
    }

    .aula-cor {
      width: 4px;
      height: 48px;
      border-radius: 2px;
    }

    .aula-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .aula-turma {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--gray-800);
    }

    .aula-topico {
      font-size: 0.8125rem;
      color: var(--gray-600);
    }

    .aula-horario {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    // Empty State
    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
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
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
    }

    .modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 1.125rem;
      }
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--gray-100);
      display: flex;
      justify-content: flex-end;
    }

    .aula-detail-card {
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
      padding: 1rem;
    }

    .aula-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .aula-detail-turma {
      font-weight: 600;
      padding-left: 0.75rem;
      border-left: 3px solid;
    }

    .aula-detail-horario {
      font-size: 0.75rem;
      color: var(--gray-500);
      background: var(--white);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .aula-detail-topico {
      font-size: 0.9375rem;
      color: var(--gray-700);
      margin-bottom: 0.25rem;
    }

    .aula-detail-descricao {
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    .mt-6 {
      margin-top: 1.5rem;
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

    .btn-icon {
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gray-100);
      border-radius: 50%;

      &:hover {
        background: var(--gray-200);
      }
    }
  `]
})
export class MinhasAulasComponent implements OnInit {
  private apiService = inject(ApiService);

  loading = signal(true);
  aulas = signal<Aula[]>([]);
  turmas = signal<Turma[]>([]);

  mesAtual = new Date().getMonth();
  anoAtual = new Date().getFullYear();

  diasCalendario = signal<DiaCalendario[]>([]);
  showDiaModal = signal(false);
  diaSelecionado = signal<DiaCalendario | null>(null);

  proximasAulas = computed(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return this.aulas()
      .filter(a => new Date(a.data + 'T00:00:00') >= hoje)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Buscar turmas do aluno usando o endpoint /me
    this.apiService.getMinhasTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
      },
      error: () => {}
    });

    // Buscar aulas usando o endpoint /me
    this.apiService.getMinhasAulas().subscribe({
      next: (aulas) => {
        this.aulas.set(aulas);
        this.gerarCalendario();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  gerarCalendario(): void {
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1);
    const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0);

    const dias: DiaCalendario[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Dias do mês anterior para preencher a primeira semana
    const diasAntes = primeiroDia.getDay();
    for (let i = diasAntes - 1; i >= 0; i--) {
      const data = new Date(this.anoAtual, this.mesAtual, -i);
      dias.push({
        data,
        diaAtual: false,
        mesAtual: false,
        aulas: this.getAulasDoDia(data)
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const data = new Date(this.anoAtual, this.mesAtual, i);
      dias.push({
        data,
        diaAtual: data.getTime() === hoje.getTime(),
        mesAtual: true,
        aulas: this.getAulasDoDia(data)
      });
    }

    // Dias do próximo mês para completar a última semana
    const diasDepois = 42 - dias.length; // 6 semanas * 7 dias
    for (let i = 1; i <= diasDepois; i++) {
      const data = new Date(this.anoAtual, this.mesAtual + 1, i);
      dias.push({
        data,
        diaAtual: false,
        mesAtual: false,
        aulas: this.getAulasDoDia(data)
      });
    }

    this.diasCalendario.set(dias);
  }

  getAulasDoDia(data: Date): Aula[] {
    const dataStr = data.toISOString().split('T')[0];
    return this.aulas().filter(a => a.data === dataStr);
  }

  getCorTurma(turmaId: number): string {
    const turma = this.turmas().find(t => t.id === turmaId);
    return turma?.cor || '#6366f1';
  }

  getNomeMes(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[this.mesAtual];
  }

  mesAnterior(): void {
    if (this.mesAtual === 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    } else {
      this.mesAtual--;
    }
    this.gerarCalendario();
  }

  proximoMes(): void {
    if (this.mesAtual === 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else {
      this.mesAtual++;
    }
    this.gerarCalendario();
  }

  getDiaAula(data: string): string {
    return new Date(data + 'T00:00:00').getDate().toString().padStart(2, '0');
  }

  getMesAula(data: string): string {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[new Date(data + 'T00:00:00').getMonth()];
  }

  abrirDetalheDia(dia: DiaCalendario): void {
    this.diaSelecionado.set(dia);
    this.showDiaModal.set(true);
  }

  closeDiaModal(): void {
    this.showDiaModal.set(false);
    this.diaSelecionado.set(null);
  }

  formatDataModal(): string {
    const dia = this.diaSelecionado();
    if (!dia) return '';
    return dia.data.toLocaleDateString('pt-BR');
  }
}
