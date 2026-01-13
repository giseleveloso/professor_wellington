package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Idioma;
import br.unitins.topicos1.model.Nivel;
import br.unitins.topicos1.model.Turma;

public record TurmaResponseDTO(
    Long id,
    String nome,
    Idioma idioma,
    Nivel nivel,
    String horario,
    String diasSemana,
    Long idProfessor,
    String nomeProfessor,
    Integer quantidadeAlunos
) {
    public static TurmaResponseDTO valueOf(Turma turma) {
        return new TurmaResponseDTO(
            turma.getId(),
            turma.getNome(),
            turma.getIdioma(),
            turma.getNivel(),
            turma.getHorario(),
            turma.getDiasSemana(),
            turma.getProfessor() != null ? turma.getProfessor().getId() : null,
            turma.getProfessor() != null ? turma.getProfessor().getNome() : null,
            turma.getAlunos() != null ? turma.getAlunos().size() : 0
        );
    }
}
