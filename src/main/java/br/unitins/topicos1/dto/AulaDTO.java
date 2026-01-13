package br.unitins.topicos1.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AulaDTO(
    @NotNull(message = "Data é obrigatória")
    LocalDate data,
    
    @NotNull(message = "Hora de início é obrigatória")
    LocalTime horaInicio,
    
    LocalTime horaFim,
    
    @NotBlank(message = "Tópico é obrigatório")
    String topico,
    
    String descricao,
    
    Integer duracaoMinutos,
    
    @NotNull(message = "Turma é obrigatória")
    Long idTurma
) {}
