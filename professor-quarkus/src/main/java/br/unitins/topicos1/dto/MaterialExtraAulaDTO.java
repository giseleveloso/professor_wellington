package br.unitins.topicos1.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaterialExtraAulaDTO(
    @NotBlank(message = "Título é obrigatório")
    String titulo,
    
    @NotNull(message = "Tipo de conteúdo é obrigatório")
    Integer idTipoConteudo,
    
    String descricao,
    
    String urlArquivo,
    
    LocalDate dataPublicacao,
    
    @NotNull(message = "Turma é obrigatória")
    Long idTurma
) {}
