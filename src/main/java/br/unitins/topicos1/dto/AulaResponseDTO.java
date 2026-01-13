package br.unitins.topicos1.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import br.unitins.topicos1.model.Aula;

public record AulaResponseDTO(
    Long id,
    LocalDate data,
    LocalTime horaInicio,
    LocalTime horaFim,
    String topico,
    String descricao,
    Integer duracaoMinutos,
    Long idTurma,
    String nomeTurma
) {
    public static AulaResponseDTO valueOf(Aula aula) {
        return new AulaResponseDTO(
            aula.getId(),
            aula.getData(),
            aula.getHoraInicio(),
            aula.getHoraFim(),
            aula.getTopico(),
            aula.getDescricao(),
            aula.getDuracaoMinutos(),
            aula.getTurma() != null ? aula.getTurma().getId() : null,
            aula.getTurma() != null ? aula.getTurma().getNome() : null
        );
    }
}
