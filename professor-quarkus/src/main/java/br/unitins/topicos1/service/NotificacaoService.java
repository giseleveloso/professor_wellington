package br.unitins.topicos1.service;

public interface NotificacaoService {
    void enviarCobrancaEmail(Long pagamentoId);
    String gerarLinkWhatsApp(Long pagamentoId);
}
