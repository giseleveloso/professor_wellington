package br.unitins.topicos1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VideoDTO(
    @NotBlank(message = "Título é obrigatório")
    String titulo,
    
    @NotBlank(message = "Link do YouTube é obrigatório")
    String linkYoutube,
    
    String descricao,
    
    @NotNull(message = "Categoria é obrigatória")
    Integer idCategoria,
    
    @NotNull(message = "Turma é obrigatória")
    Long idTurma
) {}
