package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Turma;

public record TurmaSimpleDTO(
    Long id,
    String nome
) {
    public static TurmaSimpleDTO valueOf(Turma turma) {
        return new TurmaSimpleDTO(
            turma.getId(),
            turma.getNome()
        );
    }
}
