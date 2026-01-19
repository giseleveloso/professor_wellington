package br.unitins.topicos1.dto;

import jakarta.validation.constraints.NotNull;

public record PresencaDTO(
    Boolean presente,
    
    String status,        // "presente", "falta", "cancelada"
    String deverCasa,     // "feito", "nao_feito", "nao_aplica"
    String preparacaoAula,// "feito", "nao_feito", "nao_aplica"
    String comentario,
    String observacao,
    
    @NotNull(message = "Aula é obrigatória")
    Long idAula,
    
    @NotNull(message = "Aluno é obrigatório")
    Long idAluno
) {}
