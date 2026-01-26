package br.unitins.topicos1.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.Telefone;
import br.unitins.topicos1.repository.PagamentoRepository;
import br.unitins.topicos1.validation.ValidationException;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class NotificacaoServiceImpl implements NotificacaoService {

    @Inject
    Mailer mailer;

    @Inject
    PagamentoRepository pagamentoRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FMT = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

    @Override
    public void enviarCobrancaEmail(Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        String email = pagamento.getAluno().getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Aluno não possui email cadastrado.");
        }

        String nomeAluno = pagamento.getAluno().getNome();
        String valor = CURRENCY_FMT.format(pagamento.getValor());
        String vencimento = pagamento.getDataVencimento() != null
            ? pagamento.getDataVencimento().format(DATE_FMT)
            : "não definida";
        String mesRef = pagamento.getMesReferencia() + "/" + pagamento.getAnoReferencia();
        String status = pagamento.getStatus() != null ? pagamento.getStatus().getLabel() : "Pendente";

        String assunto = "Lembrete de Pagamento - " + mesRef;

        String corpo = """
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4f46e5;">Lembrete de Pagamento</h2>
                    <p>Olá, <strong>%s</strong>!</p>
                    <p>Este é um lembrete sobre o pagamento referente a <strong>%s</strong>.</p>

                    <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p><strong>Valor:</strong> %s</p>
                        <p><strong>Vencimento:</strong> %s</p>
                        <p><strong>Status:</strong> %s</p>
                    </div>

                    <p>Em caso de dúvidas, entre em contato com o professor.</p>
                    <br>
                    <p style="color: #888; font-size: 12px;">Este é um email automático enviado pelo sistema Professor Wellington.</p>
                </div>
            </body>
            </html>
            """.formatted(nomeAluno, mesRef, valor, vencimento, status);

        mailer.send(
            Mail.withHtml(email, assunto, corpo)
        );
    }

    @Override
    public String gerarLinkWhatsApp(Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        Telefone telefone = pagamento.getAluno().getTelefone();
        if (telefone == null || telefone.getNumero() == null || telefone.getNumero().isBlank()) {
            throw new IllegalStateException("Aluno não possui telefone cadastrado.");
        }

        String nomeAluno = pagamento.getAluno().getNome();
        String valor = CURRENCY_FMT.format(pagamento.getValor());
        String vencimento = pagamento.getDataVencimento() != null
            ? pagamento.getDataVencimento().format(DATE_FMT)
            : "não definida";
        String mesRef = pagamento.getMesReferencia() + "/" + pagamento.getAnoReferencia();

        String mensagem = "Olá, " + nomeAluno + "! "
            + "Este é um lembrete sobre o pagamento referente a " + mesRef + ". "
            + "Valor: " + valor + ". "
            + "Vencimento: " + vencimento + ". "
            + "Em caso de dúvidas, entre em contato.";

        String codigoArea = telefone.getCodigoArea() != null ? telefone.getCodigoArea() : "";
        String numero = telefone.getNumero().replaceAll("[^0-9]", "");
        String telefoneCompleto = "55" + codigoArea.replaceAll("[^0-9]", "") + numero;

        String mensagemEncoded = URLEncoder.encode(mensagem, StandardCharsets.UTF_8);

        return "https://wa.me/" + telefoneCompleto + "?text=" + mensagemEncoded;
    }
}
