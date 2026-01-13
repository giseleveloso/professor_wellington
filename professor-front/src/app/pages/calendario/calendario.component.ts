import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aula, Turma, Aluno } from '../../core/models/user.model';

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  aulas: Aula[];
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  aulas: Aula[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📅 Calendário</h2>
        <p class="text-muted">Visualização de aulas em calendário</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        + Nova Aula
      </button>
    </div>

    <!-- Controles do Calendário -->
    <div class="calendar-controls card mb-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <!-- Navegação -->
        <div class="flex items-center gap-3">
          <button class="btn btn-icon btn-secondary" (click)="previous()">◀</button>
          <h3 class="calendar-title">
            @if (viewMode === 'month') {
              {{ currentMonthName }}, {{ currentYear }}
            } @else {
              {{ weekRangeLabel }}
            }
          </h3>
          <button class="btn btn-icon btn-secondary" (click)="next()">▶</button>
          <button class="btn btn-outline btn-sm" (click)="goToToday()">Hoje</button>
        </div>

        <!-- Controles de visualização -->
        <div class="flex items-center gap-3">
          <div class="view-toggle">
            <button 
              class="view-btn" 
              [class.active]="viewMode === 'week'"
              (click)="viewMode = 'week'"
            >
              📋 Semana
            </button>
            <button 
              class="view-btn" 
              [class.active]="viewMode === 'month'"
              (click)="viewMode = 'month'"
            >
              📆 Mês
            </button>
          </div>

          <select class="form-control" style="width: auto;" [(ngModel)]="filtroTurma">
            <option [value]="0">Todas as turmas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
      </div>
    </div>

    <!-- Visualização Mensal -->
    @if (viewMode === 'month') {
      <div class="calendar card">
        <div class="calendar-weekdays">
          @for (day of weekDays; track day) {
            <div class="weekday">{{ day }}</div>
          }
        </div>

        <div class="calendar-grid">
          @for (day of calendarDays(); track day.date.toISOString()) {
            <div 
              class="calendar-day" 
              [class.other-month]="!day.isCurrentMonth"
              [class.today]="day.isToday"
              (click)="selectDay(day.date)"
            >
              <div class="day-header">
                <span class="day-number">{{ day.day }}</span>
              </div>
              <div class="day-events">
                @for (aula of day.aulas.slice(0, 3); track aula.id) {
                  <div class="event" [title]="aula.topico" (click)="openAulaDetails(aula, $event)">
                    <span class="event-time">{{ aula.horaInicio }}</span>
                    <span class="event-title">{{ aula.nomeTurma }}</span>
                  </div>
                }
                @if (day.aulas.length > 3) {
                  <div class="event-more">+{{ day.aulas.length - 3 }} mais</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Visualização Semanal -->
    @if (viewMode === 'week') {
      <div class="week-view card">
        <div class="week-header">
          @for (day of weekViewDays(); track day.date.toISOString()) {
            <div class="week-header-day" [class.today]="day.isToday">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-num">{{ day.dayNumber }}</span>
            </div>
          }
        </div>

        <div class="week-grid">
          @for (day of weekViewDays(); track day.date.toISOString()) {
            <div class="week-column" [class.today]="day.isToday" (click)="selectDay(day.date)">
              @if (day.aulas.length === 0) {
                <div class="no-events">
                  <span class="text-muted">Sem aulas</span>
                </div>
              } @else {
                @for (aula of day.aulas; track aula.id) {
                  <div class="week-event" (click)="openAulaDetails(aula, $event)">
                    <div class="week-event-time">{{ aula.horaInicio }} - {{ aula.horaFim || '--:--' }}</div>
                    <div class="week-event-turma">{{ aula.nomeTurma }}</div>
                    <div class="week-event-topic">{{ aula.topico }}</div>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- Modal Nova Aula -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingAula() ? 'Editar Aula' : 'Nova Aula' }}</h3>
            <button class="btn btn-icon" (click)="closeModal()">✕</button>
          </div>
          
          <form class="modal-body" (ngSubmit)="saveAula()">
            <div class="form-group">
              <label class="form-label">Turma</label>
              <select class="form-control" [(ngModel)]="form.idTurma" name="idTurma" required>
                @for (turma of turmas(); track turma.id) {
                  <option [value]="turma.id">{{ turma.nome }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tópico</label>
              <input type="text" class="form-control" [(ngModel)]="form.topico" name="topico" required />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" class="form-control" [(ngModel)]="form.data" name="data" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Hora Início</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaInicio" name="horaInicio" 
                  (change)="calculateDuration()" required />
              </div>
              <div class="form-group">
                <label class="form-label">Hora Fim</label>
                <input type="time" class="form-control" [(ngModel)]="form.horaFim" name="horaFim" 
                  (change)="calculateDuration()" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Duração (minutos) <span class="text-muted">- calculado automaticamente</span></label>
              <input type="number" class="form-control readonly-field" [(ngModel)]="form.duracaoMinutos" name="duracaoMinutos" readonly />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingAula() ? 'Salvar' : 'Agendar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Detalhes da Aula / Presença -->
    @if (showDetailsModal()) {
      <div class="modal-overlay" (click)="closeDetailsModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ selectedAula()?.topico }}</h3>
              <p class="text-muted">{{ selectedAula()?.nomeTurma }} - {{ formatDateLong(selectedAula()?.data || '') }}</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm" (click)="editAula(selectedAula()!)">✏️ Editar</button>
              <button class="btn btn-icon" (click)="closeDetailsModal()">✕</button>
            </div>
          </div>
          
          <div class="modal-body">
            <div class="aula-info-grid mb-4">
              <div class="info-card">
                <span class="info-icon">🕐</span>
                <div>
                  <div class="info-label">Horário</div>
                  <div class="info-value">{{ selectedAula()?.horaInicio }} - {{ selectedAula()?.horaFim || '--:--' }}</div>
                </div>
              </div>
              <div class="info-card">
                <span class="info-icon">⏱️</span>
                <div>
                  <div class="info-label">Duração</div>
                  <div class="info-value">{{ selectedAula()?.duracaoMinutos }} minutos</div>
                </div>
              </div>
            </div>

            @if (selectedAula()?.descricao) {
              <div class="mb-4">
                <h4 class="mb-2">Descrição</h4>
                <p class="text-muted">{{ selectedAula()?.descricao }}</p>
              </div>
            }

            <!-- Registro de Presença -->
            <div class="presenca-section">
              <div class="flex items-center justify-between mb-3">
                <h4>📋 Lista de Presença</h4>
                <button class="btn btn-success btn-sm" (click)="savePresencas()" [disabled]="savingPresencas()">
                  @if (savingPresencas()) {
                    <span class="spinner"></span>
                  }
                  ✓ Salvar Presenças
                </button>
              </div>

              @if (loadingAlunos()) {
                <div class="loading-state"><span class="spinner"></span></div>
              } @else if (alunosTurma().length === 0) {
                <div class="empty-state-sm">
                  <p>Nenhum aluno matriculado nesta turma</p>
                </div>
              } @else {
                <div class="presenca-list">
                  <div class="presenca-header">
                    <div class="presenca-actions-header">
                      <button class="btn btn-sm btn-outline" (click)="marcarTodos(true)">Todos presentes</button>
                      <button class="btn btn-sm btn-outline" (click)="marcarTodos(false)">Todos ausentes</button>
                    </div>
                  </div>
                  @for (aluno of alunosTurma(); track aluno.id) {
                    <div class="presenca-item">
                      <div class="presenca-aluno">
                        <div class="avatar">{{ getInitials(aluno.nome) }}</div>
                        <div>
                          <div class="font-medium">{{ aluno.nome }}</div>
                          <div class="text-muted text-xs">{{ aluno.email }}</div>
                        </div>
                      </div>
                      <div class="presenca-toggle">
                        <button 
                          class="toggle-btn" 
                          [class.presente]="presencasMap()[aluno.id].presente === true"
                          (click)="togglePresenca(aluno.id, true)"
                        >
                          ✓ Presente
                        </button>
                        <button 
                          class="toggle-btn" 
                          [class.ausente]="presencasMap()[aluno.id].presente === false"
                          (click)="togglePresenca(aluno.id, false)"
                        >
                          ✕ Ausente
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }

    .calendar-controls { padding: 1rem 1.5rem; }
    .calendar-title { font-size: 1.25rem; margin: 0; min-width: 220px; text-align: center; }

    .view-toggle {
      display: flex;
      background: var(--gray-100);
      border-radius: var(--border-radius-sm);
      padding: 4px;
    }

    .view-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--white); }

      &.active {
        background: var(--white);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
    }

    // ========== Visualização Mensal ==========
    .calendar { padding: 0; overflow: hidden; }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }

    .weekday {
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--gray-600);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar-day {
      min-height: 120px;
      border-right: 1px solid var(--gray-100);
      border-bottom: 1px solid var(--gray-100);
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;

      &:hover { background: var(--gray-50); }
      &:nth-child(7n) { border-right: none; }

      &.other-month {
        background: var(--gray-50);
        .day-number { color: var(--gray-400); }
      }

      &.today {
        .day-number {
          background: var(--primary);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .day-header { margin-bottom: 0.5rem; }

    .day-number {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
    }

    .day-events { display: flex; flex-direction: column; gap: 2px; }

    .event {
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--primary-bg);
      border-left: 3px solid var(--primary);
      font-size: 0.7rem;
      display: flex;
      gap: 4px;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:hover { background: var(--primary-light); color: white; .event-time { color: white; } }
    }

    .event-time { font-weight: 600; color: var(--primary); }
    .event-title { color: var(--gray-700); }
    .event-more { font-size: 0.7rem; color: var(--gray-500); padding: 2px 6px; }

    // ========== Visualização Semanal ==========
    .week-view { padding: 0; overflow: hidden; }

    .week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }

    .week-header-day {
      padding: 1rem;
      text-align: center;
      border-right: 1px solid var(--gray-100);

      &:last-child { border-right: none; }

      &.today {
        background: var(--primary-bg);
        .day-num { 
          background: var(--primary); 
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .day-name {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--gray-500);
      margin-bottom: 0.25rem;
    }

    .day-num {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-800);
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      min-height: 400px;
    }

    .week-column {
      border-right: 1px solid var(--gray-100);
      padding: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;

      &:last-child { border-right: none; }
      &:hover { background: var(--gray-50); }
      &.today { background: rgba(var(--primary-rgb), 0.03); }
    }

    .no-events {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 100px;
    }

    .week-event {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: var(--primary-bg);
      border-left: 4px solid var(--primary);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }

    .week-event-time {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.25rem;
    }

    .week-event-turma {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--gray-800);
    }

    .week-event-topic {
      font-size: 0.75rem;
      color: var(--gray-600);
      margin-top: 0.25rem;
    }

    // ========== Modal styles ==========
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--border-radius); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 700px; }
    .modal-header { display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .readonly-field { background: var(--gray-50); cursor: not-allowed; }

    // Info cards
    .aula-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .info-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
    }
    .info-icon { font-size: 1.5rem; }
    .info-label { font-size: 0.75rem; color: var(--gray-500); }
    .info-value { font-weight: 600; }

    // Presença styles
    .presenca-section { background: var(--gray-50); border-radius: var(--border-radius); padding: 1rem; }
    .presenca-header { margin-bottom: 1rem; }
    .presenca-actions-header { display: flex; gap: 0.5rem; }
    .presenca-list { display: flex; flex-direction: column; gap: 0.5rem; }
    
    .presenca-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--white);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--gray-200);
    }

    .presenca-aluno { display: flex; align-items: center; gap: 0.75rem; }
    .presenca-toggle { display: flex; gap: 0.5rem; }
    .text-xs { font-size: 0.75rem; }

    .toggle-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--gray-300);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--gray-50); }
      &.presente { background: var(--success); border-color: var(--success); color: white; }
      &.ausente { background: var(--danger); border-color: var(--danger); color: white; }
    }

    .loading-state, .empty-state-sm { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class CalendarioComponent implements OnInit {
  private apiService = inject(ApiService);

  turmas = signal<Turma[]>([]);
  aulas = signal<Aula[]>([]);
  alunosTurma = signal<Aluno[]>([]);
  presencasMap = signal<{ [alunoId: number]: { presente: boolean } }>({});
  
  showModal = signal(false);
  showDetailsModal = signal(false);
  editingAula = signal<Aula | null>(null);
  selectedAula = signal<Aula | null>(null);
  loadingAlunos = signal(false);
  savingPresencas = signal(false);

  viewMode: ViewMode = 'week';
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  currentWeekStart = this.getWeekStart(this.currentDate);
  filtroTurma = 0;

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  form = { idTurma: 0, topico: '', descricao: '', data: '', horaInicio: '08:00', horaFim: '10:00', duracaoMinutos: 120 };

  get currentMonthName(): string {
    return this.months[this.currentMonth];
  }

  get weekRangeLabel(): string {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${this.months[start.getMonth()]}, ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${this.months[start.getMonth()].substring(0, 3)} - ${end.getDate()} ${this.months[end.getMonth()].substring(0, 3)}, ${start.getFullYear()}`;
    }
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  calendarDays = computed(() => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const today = new Date();

    const prevMonth = new Date(this.currentYear, this.currentMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonth.getDate() - i);
      days.push(this.createMonthDay(date, false, today));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      days.push(this.createMonthDay(date, true, today));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      days.push(this.createMonthDay(date, false, today));
    }

    return days;
  });

  weekViewDays = computed(() => {
    const days: WeekDay[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(this.createWeekDay(date, today));
    }

    return days;
  });

  createMonthDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateStr = date.toISOString().split('T')[0];
    let aulas = this.aulas().filter(a => a.data === dateStr);
    if (this.filtroTurma > 0) {
      aulas = aulas.filter(a => a.idTurma === this.filtroTurma);
    }

    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      aulas: aulas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    };
  }

  createWeekDay(date: Date, today: Date): WeekDay {
    const dateStr = date.toISOString().split('T')[0];
    let aulas = this.aulas().filter(a => a.data === dateStr);
    if (this.filtroTurma > 0) {
      aulas = aulas.filter(a => a.idTurma === this.filtroTurma);
    }

    return {
      date,
      dayName: this.weekDaysFull[date.getDay()],
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      aulas: aulas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    };
  }

  ngOnInit(): void {
    this.apiService.getTurmas().subscribe(t => {
      this.turmas.set(t);
      if (t.length) this.form.idTurma = t[0].id;
    });
    this.loadAulas();
  }

  loadAulas(): void {
    this.apiService.getAulas().subscribe({
      next: aulas => this.aulas.set(aulas)
    });
  }

  previous(): void {
    if (this.viewMode === 'month') {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    } else {
      this.currentWeekStart = new Date(this.currentWeekStart);
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    }
  }

  next(): void {
    if (this.viewMode === 'month') {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    } else {
      this.currentWeekStart = new Date(this.currentWeekStart);
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    }
  }

  goToToday(): void {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.currentWeekStart = this.getWeekStart(today);
  }

  selectDay(date: Date): void {
    this.form.data = date.toISOString().split('T')[0];
    this.openModal();
  }

  openAulaDetails(aula: Aula, event: Event): void {
    event.stopPropagation();
    this.selectedAula.set(aula);
    this.showDetailsModal.set(true);
    this.loadAlunosAndPresencas(aula);
  }

  loadAlunosAndPresencas(aula: Aula): void {
    this.loadingAlunos.set(true);
    this.apiService.getAlunosByTurma(aula.idTurma).subscribe({
      next: alunos => {
        this.alunosTurma.set(alunos);
        
        this.apiService.getPresencasByAula(aula.id).subscribe({
          next: presencas => {
            const map: { [key: number]: { presente: boolean } } = {};
            presencas.forEach(p => {
              map[p.idAluno] = { presente: p.presente };
            });
            alunos.forEach(a => {
              if (!map[a.id]) {
                map[a.id] = { presente: true };
              }
            });
            this.presencasMap.set(map);
            this.loadingAlunos.set(false);
          },
          error: () => {
            const map: { [key: number]: { presente: boolean } } = {};
            alunos.forEach(a => map[a.id] = { presente: true });
            this.presencasMap.set(map);
            this.loadingAlunos.set(false);
          }
        });
      },
      error: () => this.loadingAlunos.set(false)
    });
  }

  togglePresenca(alunoId: number, presente: boolean): void {
    const current = { ...this.presencasMap() };
    current[alunoId] = { presente };
    this.presencasMap.set(current);
  }

  marcarTodos(presente: boolean): void {
    const map: { [key: number]: { presente: boolean } } = {};
    this.alunosTurma().forEach(a => map[a.id] = { presente });
    this.presencasMap.set(map);
  }

  savePresencas(): void {
    if (!this.selectedAula()) return;

    this.savingPresencas.set(true);
    const presencas = Object.entries(this.presencasMap()).map(([alunoId, data]) => ({
      presente: data.presente,
      idAula: this.selectedAula()!.id,
      idAluno: parseInt(alunoId)
    }));

    this.apiService.registrarPresencasEmLote(this.selectedAula()!.id, presencas).subscribe({
      next: () => {
        this.savingPresencas.set(false);
        alert('Presenças salvas com sucesso!');
      },
      error: () => this.savingPresencas.set(false)
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedAula.set(null);
  }

  calculateDuration(): void {
    if (this.form.horaInicio && this.form.horaFim) {
      const [h1, m1] = this.form.horaInicio.split(':').map(Number);
      const [h2, m2] = this.form.horaFim.split(':').map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      this.form.duracaoMinutos = end > start ? end - start : 0;
    }
  }

  formatDateLong(d: string): string {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    });
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : nome.substring(0, 2).toUpperCase();
  }

  openModal(): void {
    this.editingAula.set(null);
    if (!this.form.data) {
      this.form.data = new Date().toISOString().split('T')[0];
    }
    this.form.topico = '';
    this.form.descricao = '';
    this.form.horaInicio = '08:00';
    this.form.horaFim = '10:00';
    this.form.duracaoMinutos = 120;
    this.form.idTurma = this.turmas()[0]?.id || 0;
    this.showModal.set(true);
  }

  editAula(aula: Aula): void {
    this.closeDetailsModal();
    this.editingAula.set(aula);
    this.form = {
      idTurma: aula.idTurma,
      topico: aula.topico,
      descricao: aula.descricao || '',
      data: aula.data,
      horaInicio: aula.horaInicio,
      horaFim: aula.horaFim || '',
      duracaoMinutos: aula.duracaoMinutos || 60
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.data = '';
  }

  saveAula(): void {
    const obs = this.editingAula()
      ? this.apiService.updateAula(this.editingAula()!.id, this.form)
      : this.apiService.createAula(this.form);
    
    obs.subscribe({
      next: () => {
        this.closeModal();
        this.loadAulas();
      }
    });
  }
}
