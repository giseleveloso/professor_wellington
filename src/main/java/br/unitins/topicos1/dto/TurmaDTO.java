package br.unitins.topicos1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TurmaDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,
    
    @NotNull(message = "Idioma é obrigatório")
    Integer idIdioma,
    
    @NotNull(message = "Nível é obrigatório")
    Integer idNivel,
    
    @NotBlank(message = "Horário é obrigatório")
    String horario,
    
    String diasSemana,
    
    @NotNull(message = "Professor é obrigatório")
    Long idProfessor
) {}
