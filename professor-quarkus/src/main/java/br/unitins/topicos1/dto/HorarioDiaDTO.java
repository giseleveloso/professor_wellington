package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.HorarioDia;

public record HorarioDiaDTO(
    Integer diaSemana,
    String diaNome,
    String horaInicio,
    String horaFim
) {
    public static HorarioDiaDTO valueOf(HorarioDia horario) {
        return new HorarioDiaDTO(
            horario.getDiaSemana(),
            horario.getDiaNome(),
            horario.getHoraInicio(),
            horario.getHoraFim()
        );
    }
}
