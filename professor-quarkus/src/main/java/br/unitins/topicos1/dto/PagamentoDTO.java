package br.unitins.topicos1.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PagamentoDTO(
    @NotBlank(message = "Mês de referência é obrigatório")
    String mesReferencia,
    
    @NotNull(message = "Ano de referência é obrigatório")
    Integer anoReferencia,
    
    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    BigDecimal valor,
    
    @NotNull(message = "Data de vencimento é obrigatória")
    LocalDate dataVencimento,
    
    LocalDate dataPagamento,
    
    @NotNull(message = "Status é obrigatório")
    Integer idStatus,
    
    String observacao,
    
    @NotNull(message = "Aluno é obrigatório")
    Long idAluno
) {}
