package br.unitins.topicos1.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TurmaDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,
    
    String descricao,
    
    String cor,
    
    @NotNull(message = "Idioma é obrigatório")
    Integer idIdioma,
    
    Long idNivelTurma,  // Opcional no update
    
    String horario,
    
    String diasSemana,
    
    List<HorarioDiaDTO> horariosPorDia,
    
    @NotNull(message = "Professor é obrigatório")
    Long idProfessor
) {}
