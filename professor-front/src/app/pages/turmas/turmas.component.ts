import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Turma, NivelTurma } from '../../core/models/user.model';

interface DiaSemana {
  id: number;
  nome: string;
  abrev: string;
  selecionado: boolean;
  horaInicio: string;
  horaFim: string;
}

interface AulaPreview {
  data: string;
  dataFormatada: string;
  diaSemana: string;
}

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>👥 Gerenciar Turmas</h2>
        <p class="text-muted">Crie e gerencie suas turmas de idiomas</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Turma
      </button>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <span class="spinner"></span>
        <p>Carregando turmas...</p>
      </div>
    } @else if (turmas().length === 0) {
      <div class="card">
        <div class="empty-state">
          <span class="empty-icon">📚</span>
          <h3>Nenhuma turma cadastrada</h3>
          <p>Comece criando sua primeira turma</p>
          <button class="btn btn-primary mt-4" (click)="openModal()">
            Criar Turma
          </button>
        </div>
      </div>
    } @else {
      <div class="turmas-grid">
        @for (turma of turmas(); track turma.id) {
          <div class="card turma-card" [style.border-left]="'4px solid ' + (turma.cor || '#4F46E5')">
            <div class="turma-header">
              <span class="turma-flag">{{ getIdiomaFlag(turma.idioma.id) }}</span>
              <div class="turma-actions">
                <button class="btn btn-icon btn-secondary" (click)="editTurma(turma)">✏️</button>
                <button class="btn btn-icon btn-secondary" (click)="deleteTurma(turma.id)">🗑️</button>
              </div>
            </div>
            
            <h3 class="turma-nome">{{ turma.nome }}</h3>
            @if (turma.descricao) {
              <p class="turma-descricao">{{ turma.descricao }}</p>
            }
            
            <div class="turma-badges">
              <span class="badge badge-primary">{{ turma.idioma.label }}</span>
              <span class="badge badge-info">{{ turma.nivelTurma?.codigo || 'Sem nível' }}</span>
            </div>
            
            <div class="turma-info">
              <div class="info-item">
                <span class="info-icon">🕐</span>
                <span>{{ turma.horario }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span>{{ turma.diasSemana }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🎓</span>
                <span>{{ turma.quantidadeAlunos }} alunos</span>
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingTurma() ? 'Editar Turma' : 'Nova Turma' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveTurma()">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Nome da Turma</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="form.nome" 
                  name="nome"
                  placeholder="Ex: Inglês Básico - Manhã"
                  required
                />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Cor</label>
                <div class="cores-grid">
                  @for (cor of cores; track cor.valor) {
                    <button 
                      type="button"
                      class="cor-btn"
                      [class.selected]="form.cor === cor.valor"
                      [style.background-color]="cor.valor"
                      [title]="cor.nome"
                      (click)="form.cor = cor.valor"
                    ></button>
                  }
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="form.descricao" 
                name="descricao"
                placeholder="Ex: Kids - Online - Grupo"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Idioma</label>
                <select class="form-control" [(ngModel)]="form.idIdioma" name="idIdioma" required>
                  <option [value]="1">Inglês</option>
                  <option [value]="2">Espanhol</option>
                  <option [value]="3">Francês</option>
                  <option [value]="4">Alemão</option>
                  <option [value]="5">Italiano</option>
                  <option [value]="6">Japonês</option>
                  <option [value]="7">Chinês</option>
                  <option [value]="8">Coreano</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Nível</label>
                <select class="form-control" [(ngModel)]="form.idNivelTurma" name="idNivelTurma" required>
                  @for (nivel of niveisTurma(); track nivel.id) {
                    <option [value]="nivel.id">{{ nivel.codigo }} - {{ nivel.descricao }}</option>
                  }
                  @if (niveisTurma().length === 0) {
                    <option [value]="1">Iniciante</option>
                    <option [value]="2">Básico</option>
                    <option [value]="3">Intermediário</option>
                    <option [value]="4">Avançado</option>
                    <option [value]="5">Fluente</option>
                  }
                </select>
              </div>
            </div>

            <!-- Dias da Semana - Selecionáveis -->
            <div class="form-group">
              <label class="form-label">Dias da Semana</label>
              <div class="dias-semana-grid">
                @for (dia of diasSemana; track dia.id) {
                  <button 
                    type="button"
                    class="dia-btn"
                    [class.selected]="dia.selecionado"
                    (click)="toggleDia(dia)"
                  >
                    <span class="dia-abrev">{{ dia.abrev }}</span>
                    <span class="dia-nome">{{ dia.nome }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Opção de horário único ou por dia -->
            <div class="form-group">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="horarioUnico" name="horarioUnico" (change)="syncHorarios()" />
                <span class="checkmark"></span>
                Mesmo horário para todos os dias
              </label>
            </div>

            <!-- Horário Único -->
            @if (horarioUnico) {
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Hora Início</label>
                  <input type="time" class="form-control" [(ngModel)]="form.horaInicio" name="horaInicio" 
                    (change)="syncHorarios()" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Hora Fim</label>
                  <input type="time" class="form-control" [(ngModel)]="form.horaFim" name="horaFim" 
                    (change)="syncHorarios()" required />
                </div>
              </div>
            } @else {
              <!-- Horários por Dia -->
              <div class="horarios-por-dia">
                <label class="form-label mb-2">Horários por Dia</label>
                @for (dia of diasSemana; track dia.id) {
                  @if (dia.selecionado) {
                    <div class="horario-dia-row">
                      <span class="dia-label">{{ dia.nome }}</span>
                      <input type="time" class="form-control time-input" [(ngModel)]="dia.horaInicio" 
                        [name]="'horaInicio_' + dia.id" (change)="updatePreview()" />
                      <span class="horario-sep">às</span>
                      <input type="time" class="form-control time-input" [(ngModel)]="dia.horaFim" 
                        [name]="'horaFim_' + dia.id" (change)="updatePreview()" />
                    </div>
                  }
                }
              </div>
            }

            <!-- Cadastro Automático de Aulas -->
            @if (!editingTurma()) {
              <div class="auto-aulas-section">
                <div class="form-group">
                  <label class="checkbox-container">
                    <input type="checkbox" [(ngModel)]="criarAulasAuto" name="criarAulasAuto" />
                    <span class="checkmark"></span>
                    📅 Cadastrar aulas automaticamente
                  </label>
                  <p class="text-muted text-sm mt-1">
                    Cria automaticamente as aulas nos dias selecionados
                  </p>
                </div>

                @if (criarAulasAuto) {
                  <div class="auto-aulas-options">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Data Início</label>
                        <input type="date" class="form-control" [(ngModel)]="dataInicio" name="dataInicio" 
                          (change)="updatePreview()" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Duração do Período</label>
                        <div class="btn-group-select">
                          @for (mes of [1, 3, 6, 12]; track mes) {
                            <button 
                              type="button"
                              class="btn-select"
                              [class.active]="mesesDuracao === mes"
                              (click)="mesesDuracao = mes; updatePreview()"
                            >
                              {{ mes }} {{ mes === 1 ? 'mês' : 'meses' }}
                            </button>
                          }
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Tópico padrão das aulas (opcional)</label>
                      <input type="text" class="form-control" [(ngModel)]="topicoDefault" name="topicoDefault"
                        placeholder="Ex: Aula Regular" />
                    </div>

                    <!-- Preview das aulas -->
                    @if (aulasPreview().length > 0) {
                      <div class="preview-section">
                        <div class="preview-header">
                          <span>📋 {{ aulasPreview().length }} aulas serão criadas:</span>
                        </div>
                        <div class="preview-list">
                          @for (aula of aulasPreview().slice(0, 10); track aula.data) {
                            <div class="preview-item">
                              <span class="preview-dia">{{ aula.diaSemana }}</span>
                              <span class="preview-data">{{ aula.dataFormatada }}</span>
                              <span class="preview-horario text-muted">{{ form.horaInicio }} - {{ form.horaFim }}</span>
                            </div>
                          }
                          @if (aulasPreview().length > 10) {
                            <div class="preview-more">
                              ... e mais {{ aulasPreview().length - 10 }} aulas
                            </div>
                          }
                        </div>
                        <div class="preview-summary">
                          <div class="summary-item">
                            <strong>Total:</strong> {{ aulasPreview().length }} aulas
                          </div>
                          <div class="summary-item">
                            <strong>Período:</strong> {{ formatDate(dataInicio) }} até {{ formatDate(dataFim) }}
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="spinner"></span>
                }
                @if (!editingTurma() && criarAulasAuto && aulasPreview().length > 0) {
                  Criar Turma + {{ aulasPreview().length }} Aulas
                } @else {
                  {{ editingTurma() ? 'Salvar' : 'Criar Turma' }}
                }
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

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      color: var(--gray-500);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
      h3 { margin-bottom: 0.5rem; }
      p { color: var(--gray-500); }
    }

    .turmas-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .turma-card {
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    }

    .turma-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .turma-flag { font-size: 2.5rem; }
    .turma-actions { display: flex; gap: 0.5rem; }
    .turma-nome { font-size: 1.125rem; margin-bottom: 0.5rem; }
    .turma-descricao { font-size: 0.8125rem; color: var(--gray-500); margin-bottom: 0.75rem; }
    .turma-badges { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .turma-info { display: flex; flex-direction: column; gap: 0.5rem; }
    .info-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--gray-600); }
    .info-icon { width: 20px; text-align: center; }

    // Cores
    .cores-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.375rem;
    }

    .cor-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: var(--gray-800);
        box-shadow: 0 0 0 2px white, 0 0 0 4px var(--gray-400);
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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-lg { max-width: 650px; }

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

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    // Dias da Semana
    .dias-semana-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }

    .dia-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 0.5rem;
      border: 2px solid var(--gray-200);
      border-radius: var(--border-radius-sm);
      background: var(--white);
      cursor: pointer;
      transition: all 0.2s;

      &:hover { border-color: var(--primary-light); background: var(--gray-50); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-bg);
        .dia-abrev { color: var(--primary); font-weight: 700; }
      }
    }

    .dia-abrev { font-size: 1rem; font-weight: 600; color: var(--gray-700); }
    .dia-nome { font-size: 0.65rem; color: var(--gray-500); margin-top: 0.25rem; }

    // Horários por dia
    .horarios-por-dia {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
    }

    .horario-dia-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      &:last-child { margin-bottom: 0; }
    }

    .dia-label {
      font-weight: 500;
      color: var(--gray-700);
      min-width: 80px;
    }

    .time-input {
      width: 100px;
    }

    .horario-sep {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    // Checkbox
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
      &::after { content: '✓'; color: white; font-size: 12px; opacity: 0; }
    }

    .checkbox-container input:checked + .checkmark {
      background: var(--primary);
      border-color: var(--primary);
      &::after { opacity: 1; }
    }

    // Auto Aulas Section
    .auto-aulas-section {
      background: var(--gray-50);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-top: 1rem;
    }

    .auto-aulas-options { margin-top: 1rem; }

    .btn-group-select { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .btn-select {
      flex: 1;
      min-width: 70px;
      padding: 0.5rem 0.75rem;
      border: 2px solid var(--gray-200);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { border-color: var(--primary-light); }

      &.active {
        border-color: var(--primary);
        background: var(--primary-bg);
        color: var(--primary);
        font-weight: 600;
      }
    }

    // Preview Section
    .preview-section {
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

    .preview-list { max-height: 200px; overflow-y: auto; }

    .preview-item {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      border-bottom: 1px solid var(--gray-100);
      &:last-child { border-bottom: none; }
    }

    .preview-dia { font-weight: 600; color: var(--primary); }
    .preview-data { color: var(--gray-700); }
    .preview-horario { font-size: 0.75rem; }
    .preview-more { padding: 0.5rem 1rem; text-align: center; color: var(--gray-500); font-size: 0.8125rem; }

    .preview-summary {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--primary-bg);
      font-size: 0.8125rem;
    }

    .summary-item { color: var(--primary); }

    .text-sm { font-size: 0.8125rem; }
  `]
})
export class TurmasComponent implements OnInit {
  private apiService = inject(ApiService);

  turmas = signal<Turma[]>([]);
  niveisTurma = signal<NivelTurma[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingTurma = signal<Turma | null>(null);

  diasSemana: DiaSemana[] = [
    { id: 0, nome: 'Domingo', abrev: 'D', selecionado: false, horaInicio: '08:00', horaFim: '10:00' },
    { id: 1, nome: 'Segunda', abrev: 'S', selecionado: true, horaInicio: '08:00', horaFim: '10:00' },
    { id: 2, nome: 'Terça', abrev: 'T', selecionado: false, horaInicio: '08:00', horaFim: '10:00' },
    { id: 3, nome: 'Quarta', abrev: 'Q', selecionado: true, horaInicio: '08:00', horaFim: '10:00' },
    { id: 4, nome: 'Quinta', abrev: 'Q', selecionado: false, horaInicio: '08:00', horaFim: '10:00' },
    { id: 5, nome: 'Sexta', abrev: 'S', selecionado: true, horaInicio: '08:00', horaFim: '10:00' },
    { id: 6, nome: 'Sábado', abrev: 'S', selecionado: false, horaInicio: '08:00', horaFim: '10:00' },
  ];

  horarioUnico = true; // Se true, usa o mesmo horário para todos os dias

  form = {
    nome: '',
    descricao: '',
    cor: '#4F46E5',
    idIdioma: 1,
    idNivelTurma: 0,
    horaInicio: '08:00',
    horaFim: '10:00',
    idProfessor: 1
  };

  cores = [
    { valor: '#4F46E5', nome: 'Índigo' },
    { valor: '#7C3AED', nome: 'Violeta' },
    { valor: '#EC4899', nome: 'Rosa' },
    { valor: '#EF4444', nome: 'Vermelho' },
    { valor: '#F97316', nome: 'Laranja' },
    { valor: '#EAB308', nome: 'Amarelo' },
    { valor: '#22C55E', nome: 'Verde' },
    { valor: '#14B8A6', nome: 'Teal' },
    { valor: '#06B6D4', nome: 'Ciano' },
    { valor: '#3B82F6', nome: 'Azul' },
    { valor: '#6366F1', nome: 'Azul Índigo' },
    { valor: '#8B5CF6', nome: 'Roxo' },
  ];

  criarAulasAuto = false;
  dataInicio = '';
  dataFim = '';
  mesesDuracao = 3;
  topicoDefault = 'Aula Regular';

  aulasPreview = signal<AulaPreview[]>([]);

  ngOnInit(): void {
    this.loadTurmas();
    this.loadNiveis();
    this.initDates();
  }

  loadNiveis(): void {
    const professorId = 1; // TODO: pegar do auth
    this.apiService.getNiveisTurma(professorId).subscribe({
      next: niveis => {
        this.niveisTurma.set(niveis);
        if (niveis.length > 0) {
          this.form.idNivelTurma = niveis[0].id;
        }
      }
    });
  }

  initDates(): void {
    const hoje = new Date();
    this.dataInicio = hoje.toISOString().split('T')[0];
    this.updatePreview();
  }

  loadTurmas(): void {
    this.loading.set(true);
    this.apiService.getTurmas().subscribe({
      next: (turmas) => {
        this.turmas.set(turmas);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleDia(dia: DiaSemana): void {
    dia.selecionado = !dia.selecionado;
    this.updatePreview();
  }

  syncHorarios(): void {
    if (this.horarioUnico) {
      this.diasSemana.forEach(dia => {
        dia.horaInicio = this.form.horaInicio;
        dia.horaFim = this.form.horaFim;
      });
    }
    this.updatePreview();
  }

  getDiasSelecionados(): number[] {
    return this.diasSemana.filter(d => d.selecionado).map(d => d.id);
  }

  getDiasSelecionadosString(): string {
    return this.diasSemana
      .filter(d => d.selecionado)
      .map(d => d.nome)
      .join(', ');
  }

  updatePreview(): void {
    if (!this.dataInicio || !this.criarAulasAuto) {
      this.aulasPreview.set([]);
      return;
    }

    const diasSelecionados = this.getDiasSelecionados();
    if (diasSelecionados.length === 0) {
      this.aulasPreview.set([]);
      return;
    }

    const inicio = new Date(this.dataInicio + 'T00:00:00');
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + this.mesesDuracao);
    this.dataFim = fim.toISOString().split('T')[0];

    const aulas: AulaPreview[] = [];
    const current = new Date(inicio);
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    while (current < fim) {
      if (diasSelecionados.includes(current.getDay())) {
        aulas.push({
          data: current.toISOString().split('T')[0],
          dataFormatada: current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          diaSemana: diasNomes[current.getDay()]
        });
      }
      current.setDate(current.getDate() + 1);
    }

    this.aulasPreview.set(aulas);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getIdiomaFlag(idIdioma: number): string {
    const flags: { [key: number]: string } = {
      1: '🇺🇸', 2: '🇪🇸', 3: '🇫🇷', 4: '🇩🇪', 5: '🇮🇹',
      6: '🇯🇵', 7: '🇨🇳', 8: '🇰🇷', 9: '🇧🇷', 10: '🌍'
    };
    return flags[idIdioma] || '🌍';
  }

  openModal(): void {
    this.editingTurma.set(null);
    this.form = {
      nome: '',
      descricao: '',
      cor: '#4F46E5',
      idIdioma: 1,
      idNivelTurma: this.niveisTurma().length > 0 ? this.niveisTurma()[0].id : 0,
      horaInicio: '08:00',
      horaFim: '10:00',
      idProfessor: 1
    };
    this.diasSemana.forEach(d => d.selecionado = [1, 3, 5].includes(d.id)); // Segunda, Quarta, Sexta
    this.horarioUnico = true;
    this.criarAulasAuto = false;
    this.mesesDuracao = 3;
    this.topicoDefault = 'Aula Regular';
    this.initDates();
    this.showModal.set(true);
  }

  editTurma(turma: Turma): void {
    this.editingTurma.set(turma);
    
    // Extrair horário inicio e fim do campo geral
    const horarioMatch = turma.horario?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    const horaInicio = horarioMatch ? horarioMatch[1] : '08:00';
    const horaFim = horarioMatch ? horarioMatch[2] : '10:00';

    this.form = {
      nome: turma.nome,
      descricao: turma.descricao || '',
      cor: turma.cor || '#4F46E5',
      idIdioma: turma.idioma.id,
      idNivelTurma: turma.nivelTurma?.id || 0,
      horaInicio,
      horaFim,
      idProfessor: turma.idProfessor
    };

    // Resetar dias da semana
    this.diasSemana.forEach(d => {
      d.selecionado = false;
      d.horaInicio = horaInicio;
      d.horaFim = horaFim;
    });

    // Verificar se tem horários por dia e carregar
    if (turma.horariosPorDia && turma.horariosPorDia.length > 0) {
      // Marcar os dias e definir horários específicos
      turma.horariosPorDia.forEach(h => {
        const dia = this.diasSemana.find(d => d.id === h.diaSemana);
        if (dia) {
          dia.selecionado = true;
          dia.horaInicio = h.horaInicio || horaInicio;
          dia.horaFim = h.horaFim || horaFim;
        }
      });

      // Verificar se os horários são iguais (horário único)
      const diasSelecionados = this.diasSemana.filter(d => d.selecionado);
      const primeiroHorario = diasSelecionados[0];
      this.horarioUnico = diasSelecionados.every(d => 
        d.horaInicio === primeiroHorario.horaInicio && d.horaFim === primeiroHorario.horaFim
      );
    } else {
      // Fallback: marcar dias da semana pelo texto
      this.diasSemana.forEach(d => {
        d.selecionado = turma.diasSemana?.toLowerCase().includes(d.nome.toLowerCase()) || false;
      });
      this.horarioUnico = true;
    }

    this.criarAulasAuto = false;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  calculateDuracaoMinutos(): number {
    if (this.form.horaInicio && this.form.horaFim) {
      const [h1, m1] = this.form.horaInicio.split(':').map(Number);
      const [h2, m2] = this.form.horaFim.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      return end > start ? end - start : 0;
    }
    return 60;
  }

  getHorariosPorDia(): any[] {
    return this.diasSemana
      .filter(d => d.selecionado)
      .map(d => ({
        diaSemana: d.id,
        diaNome: d.nome,
        horaInicio: this.horarioUnico ? this.form.horaInicio : d.horaInicio,
        horaFim: this.horarioUnico ? this.form.horaFim : d.horaFim
      }));
  }

  saveTurma(): void {
    this.saving.set(true);

    const horariosPorDia = this.getHorariosPorDia();

    // Garantir que os valores são convertidos para os tipos corretos
    const data = {
      nome: this.form.nome,
      descricao: this.form.descricao,
      cor: this.form.cor,
      idIdioma: Number(this.form.idIdioma),
      idNivelTurma: Number(this.form.idNivelTurma),
      horario: `${this.form.horaInicio} - ${this.form.horaFim}`,
      diasSemana: this.getDiasSelecionadosString(),
      horariosPorDia: horariosPorDia,
      idProfessor: Number(this.form.idProfessor)
    };

    console.log('Enviando turma:', data); // Debug

    if (this.editingTurma()) {
      this.apiService.updateTurma(this.editingTurma()!.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTurmas();
        },
        error: (err) => {
          console.error('Erro ao atualizar turma:', err);
          this.saving.set(false);
        }
      });
    } else {
      this.apiService.createTurma(data).subscribe({
        next: (turmaCriada: any) => {
          // Se deve criar aulas automaticamente
          if (this.criarAulasAuto && this.aulasPreview().length > 0) {
            this.criarAulasAutomaticamente(turmaCriada.id);
          } else {
            this.saving.set(false);
            this.closeModal();
            this.loadTurmas();
          }
        },
        error: () => this.saving.set(false)
      });
    }
  }

  getHorarioParaDia(diaSemana: number): { horaInicio: string; horaFim: string } {
    const dia = this.diasSemana.find(d => d.id === diaSemana);
    if (dia && !this.horarioUnico) {
      return { horaInicio: dia.horaInicio, horaFim: dia.horaFim };
    }
    return { horaInicio: this.form.horaInicio, horaFim: this.form.horaFim };
  }

  calculateDuracaoMinutosParaHorario(horaInicio: string, horaFim: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFim.split(':').map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    return end > start ? end - start : 60;
  }

  criarAulasAutomaticamente(turmaId: number): void {
    const aulas = this.aulasPreview();
    let completed = 0;
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    aulas.forEach((aulaPreview, index) => {
      // Descobrir qual dia da semana é essa aula
      const dataAula = new Date(aulaPreview.data + 'T00:00:00');
      const diaSemana = dataAula.getDay();
      
      // Pegar o horário específico para esse dia
      const horario = this.getHorarioParaDia(diaSemana);
      const duracaoMinutos = this.calculateDuracaoMinutosParaHorario(horario.horaInicio, horario.horaFim);

      const aula = {
        idTurma: turmaId,
        topico: this.topicoDefault || `Aula ${index + 1}`,
        descricao: '',
        data: aulaPreview.data,
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
        duracaoMinutos
      };

      this.apiService.createAula(aula).subscribe({
        next: () => {
          completed++;
          if (completed === aulas.length) {
            this.saving.set(false);
            this.closeModal();
            this.loadTurmas();
            alert(`Turma criada com sucesso!\n${aulas.length} aulas foram cadastradas automaticamente.`);
          }
        },
        error: () => {
          completed++;
          if (completed === aulas.length) {
            this.saving.set(false);
            this.closeModal();
            this.loadTurmas();
          }
        }
      });
    });
  }

  deleteTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.apiService.deleteTurma(id).subscribe({
        next: () => this.loadTurmas(),
        error: () => {}
      });
    }
  }
}
