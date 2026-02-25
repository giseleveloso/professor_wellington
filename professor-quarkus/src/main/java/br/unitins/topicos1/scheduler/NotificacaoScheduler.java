package br.unitins.topicos1.scheduler;

import br.unitins.topicos1.service.EmailService;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class NotificacaoScheduler {

    private static final Logger LOG = Logger.getLogger(NotificacaoScheduler.class);

    @Inject
    EmailService emailService;

    // Todo dia às 08:00 - cobranças de pagamentos atrasados
    @Scheduled(cron = "0 0 8 * * ?")
    public void verificarPagamentosAtrasados() {
        LOG.info("Scheduler: verificando pagamentos atrasados...");
        int enviados = emailService.enviarPagamentosAtrasados();
        LOG.infof("Scheduler: %d e-mail(s) de pagamento atrasado enviado(s).", enviados);
    }

    // Todo dia às 08:05 - lembretes de pagamentos a vencer em 3 dias
    @Scheduled(cron = "0 5 8 * * ?")
    public void verificarPagamentosAVencer() {
        LOG.info("Scheduler: verificando pagamentos a vencer...");
        int enviados = emailService.enviarPagamentosAVencer(3);
        LOG.infof("Scheduler: %d e-mail(s) de pagamento a vencer enviado(s).", enviados);
    }

    // Todo dia às 18:00 - lembretes de aulas do dia seguinte
    @Scheduled(cron = "0 0 18 * * ?")
    public void enviarLembretesAula() {
        LOG.info("Scheduler: enviando lembretes de aula para amanhã...");
        int enviados = emailService.enviarLembretesAulaAmanha();
        LOG.infof("Scheduler: %d e-mail(s) de lembrete de aula enviado(s).", enviados);
    }
}
