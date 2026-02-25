package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.StatusPagamento;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.repository.AulaRepository;
import br.unitins.topicos1.repository.PagamentoRepository;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class EmailServiceImpl implements EmailService {

    private static final Logger LOG = Logger.getLogger(EmailServiceImpl.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Inject
    Mailer mailer;

    @Inject
    PagamentoRepository pagamentoRepository;

    @Inject
    AulaRepository aulaRepository;

    @Override
    public void enviarCobrancaPagamento(Pagamento pagamento) {
        Aluno aluno = pagamento.getAluno();
        if (aluno == null || aluno.getEmail() == null || aluno.getEmail().isBlank()) {
            return;
        }
        String assunto = String.format("[ClassHub] Pagamento em atraso - %s/%d",
                pagamento.getMesReferencia(), pagamento.getAnoReferencia());
        String corpo = montarEmailPagamentoAtrasado(pagamento, aluno);
        enviar(aluno.getEmail(), assunto, corpo);
    }

    @Override
    public void enviarLembretePagamento(Pagamento pagamento, int diasParaVencer) {
        Aluno aluno = pagamento.getAluno();
        if (aluno == null || aluno.getEmail() == null || aluno.getEmail().isBlank()) {
            return;
        }
        String assunto = String.format("[ClassHub] Lembrete de vencimento - %s/%d",
                pagamento.getMesReferencia(), pagamento.getAnoReferencia());
        String corpo = montarEmailLembretePagamento(pagamento, aluno, diasParaVencer);
        enviar(aluno.getEmail(), assunto, corpo);
    }

    @Override
    public void enviarMudancaHorario(Turma turma, String horarioAntigo) {
        List<Aluno> alunos = turma.getAlunos();
        if (alunos == null || alunos.isEmpty()) {
            return;
        }
        String assunto = String.format("[ClassHub] Atualização de horário - %s", turma.getNome());
        for (Aluno aluno : alunos) {
            if (aluno.getEmail() == null || aluno.getEmail().isBlank()) {
                continue;
            }
            String corpo = montarEmailMudancaHorario(turma, aluno, horarioAntigo);
            enviar(aluno.getEmail(), assunto, corpo);
        }
    }

    @Override
    public void enviarLembreteAula(Aula aula) {
        Turma turma = aula.getTurma();
        if (turma == null) {
            return;
        }
        List<Aluno> alunos = turma.getAlunos();
        if (alunos == null || alunos.isEmpty()) {
            return;
        }
        String assunto = String.format("[ClassHub] Lembrete de aula amanhã - %s", turma.getNome());
        for (Aluno aluno : alunos) {
            if (aluno.getEmail() == null || aluno.getEmail().isBlank()) {
                continue;
            }
            String corpo = montarEmailLembreteAula(aula, aluno);
            enviar(aluno.getEmail(), assunto, corpo);
        }
    }

    @Override
    public int enviarPagamentosAtrasados() {
        List<Pagamento> atrasados = pagamentoRepository.findByStatus(StatusPagamento.ATRASADO);
        int enviados = 0;
        for (Pagamento pagamento : atrasados) {
            try {
                enviarCobrancaPagamento(pagamento);
                enviados++;
            } catch (Exception e) {
                LOG.warnf("Erro ao enviar e-mail de cobrança para pagamento %d: %s", pagamento.getId(), e.getMessage());
            }
        }
        LOG.infof("E-mails de pagamento atrasado enviados: %d", enviados);
        return enviados;
    }

    @Override
    public int enviarPagamentosAVencer(int dias) {
        LocalDate limite = LocalDate.now().plusDays(dias);
        List<Pagamento> pendentes = pagamentoRepository.findByStatus(StatusPagamento.PENDENTE);
        int enviados = 0;
        for (Pagamento pagamento : pendentes) {
            if (pagamento.getDataVencimento() != null
                    && !pagamento.getDataVencimento().isAfter(limite)
                    && !pagamento.getDataVencimento().isBefore(LocalDate.now())) {
                try {
                    long diasRestantes = LocalDate.now().until(pagamento.getDataVencimento()).getDays();
                    enviarLembretePagamento(pagamento, (int) diasRestantes);
                    enviados++;
                } catch (Exception e) {
                    LOG.warnf("Erro ao enviar lembrete para pagamento %d: %s", pagamento.getId(), e.getMessage());
                }
            }
        }
        LOG.infof("E-mails de pagamento a vencer enviados: %d", enviados);
        return enviados;
    }

    @Override
    public int enviarLembretesAulaAmanha() {
        LocalDate amanha = LocalDate.now().plusDays(1);
        List<Aula> aulas = aulaRepository.findByData(amanha);
        int enviados = 0;
        for (Aula aula : aulas) {
            try {
                enviarLembreteAula(aula);
                enviados++;
            } catch (Exception e) {
                LOG.warnf("Erro ao enviar lembrete de aula %d: %s", aula.getId(), e.getMessage());
            }
        }
        LOG.infof("E-mails de lembrete de aula enviados: %d", enviados);
        return enviados;
    }

    private void enviar(String destinatario, String assunto, String corpo) {
        try {
            mailer.send(Mail.withHtml(destinatario, assunto, corpo));
        } catch (Exception e) {
            LOG.warnf("Falha ao enviar e-mail para %s: %s", destinatario, e.getMessage());
        }
    }

    // ==================== Templates HTML ====================

    private String montarEmailPagamentoAtrasado(Pagamento p, Aluno aluno) {
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#e53e3e'>⚠️ Pagamento em Atraso</h2>"
                + "<p>Olá, <strong>" + aluno.getNome() + "</strong>!</p>"
                + "<p>Identificamos um pagamento em atraso em sua conta:</p>"
                + "<table style='border-collapse:collapse;width:100%;max-width:400px'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Referência</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + p.getMesReferencia() + "/" + p.getAnoReferencia() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Valor</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>R$ " + String.format("%.2f", p.getValor()) + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Vencimento</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + (p.getDataVencimento() != null ? p.getDataVencimento().format(DATE_FMT) : "-") + "</td></tr>"
                + "</table>"
                + "<p style='margin-top:16px'>Por favor, entre em contato com seu professor para regularizar a situação.</p>"
                + "<hr><p style='font-size:12px;color:#999'>ClassHub - Sistema de Gestão de Aulas</p>"
                + "</body></html>";
    }

    private String montarEmailLembretePagamento(Pagamento p, Aluno aluno, int diasParaVencer) {
        String prazo = diasParaVencer == 0 ? "hoje" : "em " + diasParaVencer + " dia(s)";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#d69e2e'>📅 Lembrete de Vencimento</h2>"
                + "<p>Olá, <strong>" + aluno.getNome() + "</strong>!</p>"
                + "<p>Seu pagamento vence <strong>" + prazo + "</strong>:</p>"
                + "<table style='border-collapse:collapse;width:100%;max-width:400px'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Referência</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + p.getMesReferencia() + "/" + p.getAnoReferencia() + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Valor</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>R$ " + String.format("%.2f", p.getValor()) + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Vencimento</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + (p.getDataVencimento() != null ? p.getDataVencimento().format(DATE_FMT) : "-") + "</td></tr>"
                + "</table>"
                + "<hr><p style='font-size:12px;color:#999'>ClassHub - Sistema de Gestão de Aulas</p>"
                + "</body></html>";
    }

    private String montarEmailMudancaHorario(Turma turma, Aluno aluno, String horarioAntigo) {
        String horarioNovo = turma.getHorario() != null ? turma.getHorario() : "a confirmar";
        String diasNovos = turma.getDiasSemana() != null ? turma.getDiasSemana() : "";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#3182ce'>🕐 Atualização de Horário</h2>"
                + "<p>Olá, <strong>" + aluno.getNome() + "</strong>!</p>"
                + "<p>O horário da turma <strong>" + turma.getNome() + "</strong> foi atualizado:</p>"
                + "<table style='border-collapse:collapse;width:100%;max-width:400px'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Horário anterior</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd;color:#999'>" + (horarioAntigo != null ? horarioAntigo : "-") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Novo horário</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd;color:#2f855a'><b>" + horarioNovo + "</b></td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Dias</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + diasNovos + "</td></tr>"
                + "</table>"
                + "<p style='margin-top:16px'>Em caso de dúvidas, entre em contato com seu professor.</p>"
                + "<hr><p style='font-size:12px;color:#999'>ClassHub - Sistema de Gestão de Aulas</p>"
                + "</body></html>";
    }

    private String montarEmailLembreteAula(Aula aula, Aluno aluno) {
        Turma turma = aula.getTurma();
        String nomeTurma = turma != null ? turma.getNome() : "";
        String nomeProfessor = (turma != null && turma.getProfessor() != null) ? turma.getProfessor().getNome() : "";
        return "<html><body style='font-family:Arial,sans-serif;color:#333'>"
                + "<h2 style='color:#38a169'>📚 Lembrete de Aula</h2>"
                + "<p>Olá, <strong>" + aluno.getNome() + "</strong>!</p>"
                + "<p>Você tem aula <strong>amanhã</strong>:</p>"
                + "<table style='border-collapse:collapse;width:100%;max-width:400px'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Turma</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + nomeTurma + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Data</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + (aula.getData() != null ? aula.getData().format(DATE_FMT) : "-") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Horário</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>"
                + (aula.getHoraInicio() != null ? aula.getHoraInicio().toString() : "") + " - "
                + (aula.getHoraFim() != null ? aula.getHoraFim().toString() : "") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Tópico</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + (aula.getTopico() != null ? aula.getTopico() : "-") + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><b>Professor</b></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + nomeProfessor + "</td></tr>"
                + "</table>"
                + "<hr><p style='font-size:12px;color:#999'>ClassHub - Sistema de Gestão de Aulas</p>"
                + "</body></html>";
    }
}
