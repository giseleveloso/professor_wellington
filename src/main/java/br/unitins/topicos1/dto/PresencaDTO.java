package br.unitins.topicos1.dto;

import jakarta.validation.constraints.NotNull;

public record PresencaDTO(
    @NotNull(message = "Presença é obrigatória")
    Boolean presente,
    
    String observacao,
    
    @NotNull(message = "Aula é obrigatória")
    Long idAula,
    
    @NotNull(message = "Aluno é obrigatório")
    Long idAluno
) {}
