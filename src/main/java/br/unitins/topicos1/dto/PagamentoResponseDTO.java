package br.unitins.topicos1.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.StatusPagamento;

public record PagamentoResponseDTO(
    Long id,
    String mesReferencia,
    Integer anoReferencia,
    BigDecimal valor,
    LocalDate dataVencimento,
    LocalDate dataPagamento,
    StatusPagamento status,
    String observacao,
    Long idAluno,
    String nomeAluno
) {
    public static PagamentoResponseDTO valueOf(Pagamento pagamento) {
        return new PagamentoResponseDTO(
            pagamento.getId(),
            pagamento.getMesReferencia(),
            pagamento.getAnoReferencia(),
            pagamento.getValor(),
            pagamento.getDataVencimento(),
            pagamento.getDataPagamento(),
            pagamento.getStatus(),
            pagamento.getObservacao(),
            pagamento.getAluno() != null ? pagamento.getAluno().getId() : null,
            pagamento.getAluno() != null ? pagamento.getAluno().getNome() : null
        );
    }
}
