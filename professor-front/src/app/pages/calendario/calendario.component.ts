import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Aula, Turma, Aluno, StatusPresenca, StatusDeverCasa, StatusPreparacaoAula } from '../../core/models/user.model';

interface PresencaAluno {
  status: StatusPresenca;
  deverCasa: StatusDeverCasa;
  preparacaoAula: StatusPreparacaoAula;
  comentario: string;
}

interface DesempenhoAluno {
  id?: number;
  nota: number | null;
  comentario: string;
  privado: boolean;
}

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
            @if (viewMode() === 'month') {
              {{ currentMonthName() }}, {{ currentYear() }}
            } @else {
              {{ weekRangeLabel() }}
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
              [class.active]="viewMode() === 'week'"
              (click)="viewMode.set('week')"
            >
              📋 Semana
            </button>
            <button 
              class="view-btn" 
              [class.active]="viewMode() === 'month'"
              (click)="viewMode.set('month')"
            >
              📆 Mês
            </button>
          </div>

          <select class="form-control" style="width: auto;" [ngModel]="filtroTurma()" (ngModelChange)="filtroTurma.set($event)">
            <option [value]="0">Todas as turmas</option>
            @for (turma of turmas(); track turma.id) {
              <option [value]="turma.id">{{ turma.nome }}</option>
            }
          </select>
        </div>
      </div>
    </div>

    <!-- Visualização Mensal -->
    @if (viewMode() === 'month') {
      <div class="calendar card">
        <div class="calendar-weekdays">
          @for (day of weekDays; track day) {
            <div class="weekday">{{ day }}</div>
          }
        </div>

        <div class="calendar-grid">
          @for (day of calendarDays(); track $index) {
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
                  <div class="event" [title]="aula.topico" (click)="openAulaDetails(aula, $event)"
                    [style.border-left-color]="getTurmaCor(aula.idTurma)"
                    [style.background-color]="getTurmaCor(aula.idTurma) + '15'">
                    <span class="event-time" [style.color]="getTurmaCor(aula.idTurma)">{{ aula.horaInicio }}</span>
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
    @if (viewMode() === 'week') {
      <div class="week-view card">
        <div class="week-header">
          @for (day of weekViewDays(); track $index) {
            <div class="week-header-day" [class.today]="day.isToday">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-num">{{ day.dayNumber }}</span>
            </div>
          }
        </div>

        <div class="week-grid">
          @for (day of weekViewDays(); track $index) {
            <div class="week-column" [class.today]="day.isToday" (click)="selectDay(day.date)">
              @if (day.aulas.length === 0) {
                <div class="no-events">
                  <span class="text-muted">Sem aulas</span>
                </div>
              } @else {
                @for (aula of day.aulas; track aula.id) {
                  <div class="week-event" (click)="openAulaDetails(aula, $event)"
                    [style.border-left-color]="getTurmaCor(aula.idTurma)"
                    [style.background-color]="getTurmaCor(aula.idTurma) + '10'">
                    <div class="week-event-time" [style.color]="getTurmaCor(aula.idTurma)">{{ aula.horaInicio }} - {{ aula.horaFim || '--:--' }}</div>
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

            <!-- Registro de Presença Completo -->
            <div class="presenca-section">
              <div class="flex items-center justify-between mb-3">
                <h4>📋 Registro de Aula</h4>
                <button class="btn btn-success btn-sm" (click)="savePresencas()" [disabled]="savingPresencas()">
                  @if (savingPresencas()) {
                    <span class="spinner"></span>
                  }
                  ✓ Salvar Registros
                </button>
              </div>

              @if (loadingAlunos()) {
                <div class="loading-state"><span class="spinner"></span></div>
              } @else if (alunosTurma().length === 0) {
                <div class="empty-state-sm">
                  <p>Nenhum aluno matriculado nesta turma</p>
                </div>
              } @else {
                <div class="presenca-list-full">
                  @for (aluno of alunosTurma(); track aluno.id) {
                    <div class="presenca-card">
                      <div class="presenca-card-header">
                        <div class="presenca-aluno">
                          <div class="avatar">{{ getInitials(aluno.nome) }}</div>
                          <div>
                            <div class="font-medium">{{ aluno.nome }}</div>
                            <div class="text-muted text-xs">{{ aluno.email }}</div>
                          </div>
                        </div>
                      </div>

                      <div class="presenca-card-body">
                        <!-- Status da Presença -->
                        <div class="presenca-row">
                          <label class="presenca-label">Presença</label>
                          <div class="status-buttons">
                            <button 
                              type="button"
                              class="status-btn presente"
                              [class.active]="presencasMap()[aluno.id].status === 'presente'"
                              (click)="setStatus(aluno.id, 'presente')"
                            >✓ Presente</button>
                            <button 
                              type="button"
                              class="status-btn falta"
                              [class.active]="presencasMap()[aluno.id].status === 'falta'"
                              (click)="setStatus(aluno.id, 'falta')"
                            >✕ Falta</button>
                            <button 
                              type="button"
                              class="status-btn cancelada"
                              [class.active]="presencasMap()[aluno.id].status === 'cancelada'"
                              (click)="setStatus(aluno.id, 'cancelada')"
                            >⊘ Cancelada</button>
                          </div>
                        </div>

                        <!-- Dever de Casa -->
                        <div class="presenca-row">
                          <label class="presenca-label">📝 Dever de Casa</label>
                          <div class="status-buttons small">
                            <button 
                              type="button"
                              class="status-btn sm feito"
                              [class.active]="presencasMap()[aluno.id].deverCasa === 'feito'"
                              (click)="setDeverCasa(aluno.id, 'feito')"
                            >Feito</button>
                            <button 
                              type="button"
                              class="status-btn sm nao-feito"
                              [class.active]="presencasMap()[aluno.id].deverCasa === 'nao_feito'"
                              (click)="setDeverCasa(aluno.id, 'nao_feito')"
                            >Não Feito</button>
                            <button 
                              type="button"
                              class="status-btn sm na"
                              [class.active]="presencasMap()[aluno.id].deverCasa === 'nao_aplica'"
                              (click)="setDeverCasa(aluno.id, 'nao_aplica')"
                            >N/A</button>
                          </div>
                        </div>

                        <!-- Preparação para Aula -->
                        <div class="presenca-row">
                          <label class="presenca-label">📚 Preparação</label>
                          <div class="status-buttons small">
                            <button 
                              type="button"
                              class="status-btn sm feito"
                              [class.active]="presencasMap()[aluno.id].preparacaoAula === 'feito'"
                              (click)="setPreparacao(aluno.id, 'feito')"
                            >Feito</button>
                            <button 
                              type="button"
                              class="status-btn sm nao-feito"
                              [class.active]="presencasMap()[aluno.id].preparacaoAula === 'nao_feito'"
                              (click)="setPreparacao(aluno.id, 'nao_feito')"
                            >Não Feito</button>
                            <button 
                              type="button"
                              class="status-btn sm na"
                              [class.active]="presencasMap()[aluno.id].preparacaoAula === 'nao_aplica'"
                              (click)="setPreparacao(aluno.id, 'nao_aplica')"
                            >N/A</button>
                          </div>
                        </div>

                        <!-- Nota/Desempenho -->
                        <div class="presenca-row nota-row">
                          <label class="presenca-label">⭐ Nota</label>
                          <div class="nota-input-group">
                            <input
                              type="number"
                              class="form-control nota-input"
                              min="0"
                              max="10"
                              step="0.5"
                              placeholder="0-10"
                              [value]="desempenhoMap()[aluno.id]?.nota ?? ''"
                              (input)="setNota(aluno.id, $event)"
                            />
                            <span class="nota-max">/10</span>
                          </div>
                        </div>

                        <!-- Feedback do Desempenho -->
                        <div class="presenca-row comentario-row">
                          <label class="presenca-label">📝 Feedback</label>
                          <textarea
                            class="form-control comentario-input"
                            placeholder="Feedback sobre o desempenho do aluno..."
                            [value]="desempenhoMap()[aluno.id]?.comentario || ''"
                            (input)="setFeedback(aluno.id, $event)"
                            rows="2"
                          ></textarea>
                          <label class="checkbox-label mt-2">
                            <input
                              type="checkbox"
                              [checked]="desempenhoMap()[aluno.id]?.privado || false"
                              (change)="setPrivado(aluno.id, $event)"
                            />
                            <span>Feedback privado (não visível ao aluno)</span>
                          </label>
                        </div>

                        <!-- Comentário da Presença -->
                        <div class="presenca-row comentario-row">
                          <label class="presenca-label">💬 Observação</label>
                          <textarea
                            class="form-control comentario-input"
                            placeholder="Observações sobre presença/aula..."
                            [value]="presencasMap()[aluno.id].comentario || ''"
                            (input)="setComentario(aluno.id, $event)"
                            rows="2"
                          ></textarea>
                        </div>
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
      border-left: 3px solid;
      font-size: 0.7rem;
      display: flex;
      gap: 4px;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { filter: brightness(0.95); }
    }

    .event-time { font-weight: 600; }
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

    // Presença styles - Full version
    .presenca-section { background: var(--gray-50); border-radius: var(--border-radius); padding: 1rem; }
    .presenca-list-full { display: flex; flex-direction: column; gap: 1rem; }
    
    .presenca-card {
      background: var(--white);
      border-radius: var(--border-radius);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .presenca-card-header {
      padding: 0.75rem 1rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-100);
    }

    .presenca-card-body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .presenca-aluno { display: flex; align-items: center; gap: 0.75rem; }
    .text-xs { font-size: 0.75rem; }

    .presenca-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .comentario-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .presenca-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-600);
      min-width: 100px;
    }

    .status-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      &.small { gap: 0.25rem; }
    }

    .status-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--gray-300);
      background: var(--white);
      border-radius: var(--border-radius-sm);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--gray-50); }

      &.sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }

      &.presente.active { background: var(--success); border-color: var(--success); color: white; }
      &.falta.active { background: var(--danger); border-color: var(--danger); color: white; }
      &.cancelada.active { background: var(--gray-500); border-color: var(--gray-500); color: white; }
      &.feito.active { background: var(--success); border-color: var(--success); color: white; }
      &.nao-feito.active { background: var(--warning); border-color: var(--warning); color: white; }
      &.na.active { background: var(--gray-400); border-color: var(--gray-400); color: white; }
    }

    .comentario-input {
      font-size: 0.8125rem;
      resize: none;
    }

    .nota-row {
      align-items: center;
    }

    .nota-input-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .nota-input {
      width: 70px;
      text-align: center;
      font-weight: 600;
    }

    .nota-max {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--gray-600);
      cursor: pointer;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
      }
    }

    .mt-2 { margin-top: 0.5rem; }

    .loading-state, .empty-state-sm { text-align: center; padding: 2rem; color: var(--gray-500); }
  `]
})
export class CalendarioComponent implements OnInit {
  private apiService = inject(ApiService);

  turmas = signal<Turma[]>([]);
  turmasMap = signal<{ [id: number]: Turma }>({});
  aulas = signal<Aula[]>([]);
  alunosTurma = signal<Aluno[]>([]);
  presencasMap = signal<{ [alunoId: number]: PresencaAluno }>({});
  desempenhoMap = signal<{ [alunoId: number]: DesempenhoAluno }>({});

  showModal = signal(false);
  showDetailsModal = signal(false);
  editingAula = signal<Aula | null>(null);
  selectedAula = signal<Aula | null>(null);
  loadingAlunos = signal(false);
  savingPresencas = signal(false);

  // Transformar em signals para reatividade
  viewMode = signal<ViewMode>('week');
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth());
  currentWeekStart = signal(this.getWeekStart(new Date()));
  filtroTurma = signal(0);

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  form = { idTurma: 0, topico: '', descricao: '', data: '', horaInicio: '08:00', horaFim: '10:00', duracaoMinutos: 120 };

  currentMonthName = computed(() => this.monthNames[this.currentMonth()]);

  weekRangeLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${this.monthNames[start.getMonth()]}, ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${this.monthNames[start.getMonth()].substring(0, 3)} - ${end.getDate()} ${this.monthNames[end.getMonth()].substring(0, 3)}, ${start.getFullYear()}`;
    }
  });

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  calendarDays = computed(() => {
    const days: CalendarDay[] = [];
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const today = new Date();
    const filtro = Number(this.filtroTurma());
    const todasAulas = this.aulas();

    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push(this.createMonthDay(date, false, today, todasAulas, filtro));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push(this.createMonthDay(date, true, today, todasAulas, filtro));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createMonthDay(date, false, today, todasAulas, filtro));
    }

    return days;
  });

  weekViewDays = computed(() => {
    const days: WeekDay[] = [];
    const today = new Date();
    const weekStart = this.currentWeekStart();
    const filtro = Number(this.filtroTurma());
    const todasAulas = this.aulas();

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(this.createWeekDay(date, today, todasAulas, filtro));
    }

    return days;
  });

  createMonthDay(date: Date, isCurrentMonth: boolean, today: Date, todasAulas: Aula[], filtro: number): CalendarDay {
    const dateStr = this.formatDateStr(date);
    let aulas = todasAulas.filter(a => a.data === dateStr);
    if (filtro > 0) {
      aulas = aulas.filter(a => a.idTurma === filtro);
    }

    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      aulas: aulas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    };
  }

  createWeekDay(date: Date, today: Date, todasAulas: Aula[], filtro: number): WeekDay {
    const dateStr = this.formatDateStr(date);
    let aulas = todasAulas.filter(a => a.data === dateStr);
    if (filtro > 0) {
      aulas = aulas.filter(a => a.idTurma === filtro);
    }

    return {
      date,
      dayName: this.weekDaysFull[date.getDay()],
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      aulas: aulas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    };
  }

  formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  ngOnInit(): void {
    this.apiService.getTurmas().subscribe(t => {
      this.turmas.set(t);
      // Criar mapa de turmas para acesso rápido à cor
      const map: { [id: number]: Turma } = {};
      t.forEach(turma => map[turma.id] = turma);
      this.turmasMap.set(map);
      if (t.length) this.form.idTurma = t[0].id;
    });
    this.loadAulas();
  }

  getTurmaCor(turmaId: number): string {
    return this.turmasMap()[turmaId]?.cor || '#4F46E5';
  }

  loadAulas(): void {
    this.apiService.getAulas().subscribe({
      next: aulas => this.aulas.set(aulas)
    });
  }

  previous(): void {
    if (this.viewMode() === 'month') {
      const month = this.currentMonth();
      if (month === 0) {
        this.currentMonth.set(11);
        this.currentYear.update(y => y - 1);
      } else {
        this.currentMonth.update(m => m - 1);
      }
    } else {
      const current = this.currentWeekStart();
      const newStart = new Date(current);
      newStart.setDate(newStart.getDate() - 7);
      this.currentWeekStart.set(newStart);
    }
  }

  next(): void {
    if (this.viewMode() === 'month') {
      const month = this.currentMonth();
      if (month === 11) {
        this.currentMonth.set(0);
        this.currentYear.update(y => y + 1);
      } else {
        this.currentMonth.update(m => m + 1);
      }
    } else {
      const current = this.currentWeekStart();
      const newStart = new Date(current);
      newStart.setDate(newStart.getDate() + 7);
      this.currentWeekStart.set(newStart);
    }
  }

  goToToday(): void {
    const today = new Date();
    this.currentYear.set(today.getFullYear());
    this.currentMonth.set(today.getMonth());
    this.currentWeekStart.set(this.getWeekStart(today));
  }

  selectDay(date: Date): void {
    this.form.data = this.formatDateStr(date);
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

        // Inicializar maps vazios para todos os alunos
        const presMap: { [key: number]: PresencaAluno } = {};
        const desMap: { [key: number]: DesempenhoAluno } = {};
        alunos.forEach(a => {
          presMap[a.id] = {
            status: 'presente',
            deverCasa: 'nao_aplica',
            preparacaoAula: 'nao_aplica',
            comentario: ''
          };
          desMap[a.id] = {
            nota: null,
            comentario: '',
            privado: false
          };
        });

        // Carregar presenças
        this.apiService.getPresencasByAula(aula.id).subscribe({
          next: presencas => {
            presencas.forEach(p => {
              presMap[p.idAluno] = {
                status: p.status || (p.presente ? 'presente' : 'falta'),
                deverCasa: p.deverCasa || 'nao_aplica',
                preparacaoAula: p.preparacaoAula || 'nao_aplica',
                comentario: p.comentario || ''
              };
            });
            this.presencasMap.set(presMap);
          },
          error: () => this.presencasMap.set(presMap)
        });

        // Carregar desempenhos
        this.apiService.getDesempenhosByAula(aula.id).subscribe({
          next: desempenhos => {
            desempenhos.forEach((d: any) => {
              desMap[d.idAluno] = {
                id: d.id,
                nota: d.nota,
                comentario: d.comentario || '',
                privado: d.privado || false
              };
            });
            this.desempenhoMap.set(desMap);
            this.loadingAlunos.set(false);
          },
          error: () => {
            this.desempenhoMap.set(desMap);
            this.loadingAlunos.set(false);
          }
        });
      },
      error: () => this.loadingAlunos.set(false)
    });
  }

  setStatus(alunoId: number, status: StatusPresenca): void {
    const current = { ...this.presencasMap() };
    current[alunoId] = { ...current[alunoId], status };
    this.presencasMap.set(current);
  }

  setDeverCasa(alunoId: number, deverCasa: StatusDeverCasa): void {
    const current = { ...this.presencasMap() };
    current[alunoId] = { ...current[alunoId], deverCasa };
    this.presencasMap.set(current);
  }

  setPreparacao(alunoId: number, preparacaoAula: StatusPreparacaoAula): void {
    const current = { ...this.presencasMap() };
    current[alunoId] = { ...current[alunoId], preparacaoAula };
    this.presencasMap.set(current);
  }

  setComentario(alunoId: number, event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const current = { ...this.presencasMap() };
    current[alunoId] = { ...current[alunoId], comentario: input.value };
    this.presencasMap.set(current);
  }

  setNota(alunoId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const current = { ...this.desempenhoMap() };
    const valor = input.value ? parseFloat(input.value) : null;
    current[alunoId] = { ...current[alunoId], nota: valor };
    this.desempenhoMap.set(current);
  }

  setFeedback(alunoId: number, event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const current = { ...this.desempenhoMap() };
    current[alunoId] = { ...current[alunoId], comentario: input.value };
    this.desempenhoMap.set(current);
  }

  setPrivado(alunoId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const current = { ...this.desempenhoMap() };
    current[alunoId] = { ...current[alunoId], privado: input.checked };
    this.desempenhoMap.set(current);
  }

  savePresencas(): void {
    if (!this.selectedAula()) return;

    this.savingPresencas.set(true);
    const aulaId = this.selectedAula()!.id;

    // Preparar presenças
    const presencas = Object.entries(this.presencasMap()).map(([alunoId, data]) => ({
      presente: data.status === 'presente',
      status: data.status,
      deverCasa: data.deverCasa,
      preparacaoAula: data.preparacaoAula,
      comentario: data.comentario,
      idAula: aulaId,
      idAluno: parseInt(alunoId)
    }));

    // Salvar presenças
    this.apiService.registrarPresencasEmLote(aulaId, presencas).subscribe({
      next: () => {
        // Salvar desempenhos (notas e feedback)
        this.saveDesempenhos();
      },
      error: () => this.savingPresencas.set(false)
    });
  }

  saveDesempenhos(): void {
    const aulaId = this.selectedAula()!.id;
    const desempenhoEntries = Object.entries(this.desempenhoMap());
    let completed = 0;
    let hasError = false;

    // Filtrar apenas alunos com nota preenchida
    const alunosComNota = desempenhoEntries.filter(([_, data]) => data.nota !== null);

    if (alunosComNota.length === 0) {
      this.savingPresencas.set(false);
      alert('Registros salvos com sucesso!');
      return;
    }

    alunosComNota.forEach(([alunoId, data]) => {
      const desempenhoData = {
        nota: data.nota,
        comentario: data.comentario,
        privado: data.privado,
        idAula: aulaId,
        idAluno: parseInt(alunoId)
      };

      if (data.id) {
        // Atualizar existente
        this.apiService.updateDesempenho(data.id, desempenhoData).subscribe({
          next: () => {
            completed++;
            if (completed === alunosComNota.length) {
              this.savingPresencas.set(false);
              if (!hasError) alert('Registros salvos com sucesso!');
            }
          },
          error: () => {
            hasError = true;
            completed++;
            if (completed === alunosComNota.length) {
              this.savingPresencas.set(false);
            }
          }
        });
      } else {
        // Criar novo
        this.apiService.createDesempenho(desempenhoData).subscribe({
          next: (created: any) => {
            // Atualizar o ID no map
            const current = { ...this.desempenhoMap() };
            current[parseInt(alunoId)] = { ...data, id: created.id };
            this.desempenhoMap.set(current);
            completed++;
            if (completed === alunosComNota.length) {
              this.savingPresencas.set(false);
              if (!hasError) alert('Registros salvos com sucesso!');
            }
          },
          error: () => {
            hasError = true;
            completed++;
            if (completed === alunosComNota.length) {
              this.savingPresencas.set(false);
            }
          }
        });
      }
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
