package br.unitins.topicos1.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record DesempenhoDTO(
    @DecimalMin(value = "0.0", message = "Nota mínima é 0")
    @DecimalMax(value = "10.0", message = "Nota máxima é 10")
    BigDecimal nota,
    
    String comentario,
    
    Boolean privado,
    
    @NotNull(message = "Aula é obrigatória")
    Long idAula,
    
    @NotNull(message = "Aluno é obrigatório")
    Long idAluno
) {}
