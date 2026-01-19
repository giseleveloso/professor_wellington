package br.unitins.topicos1.dto;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.model.Idioma;
import br.unitins.topicos1.model.Turma;

public record TurmaResponseDTO(
    Long id,
    String nome,
    Idioma idioma,
    NivelTurmaResponseDTO nivelTurma,
    String horario,
    String diasSemana,
    List<HorarioDiaDTO> horariosPorDia,
    Long idProfessor,
    String nomeProfessor,
    Integer quantidadeAlunos
) {
    public static TurmaResponseDTO valueOf(Turma turma) {
        List<HorarioDiaDTO> horarios = null;
        if (turma.getHorariosPorDia() != null && !turma.getHorariosPorDia().isEmpty()) {
            horarios = turma.getHorariosPorDia().stream()
                .map(HorarioDiaDTO::valueOf)
                .collect(Collectors.toList());
        }
        
        return new TurmaResponseDTO(
            turma.getId(),
            turma.getNome(),
            turma.getIdioma(),
            turma.getNivelTurma() != null ? NivelTurmaResponseDTO.valueOf(turma.getNivelTurma()) : null,
            turma.getHorario(),
            turma.getDiasSemana(),
            horarios,
            turma.getProfessor() != null ? turma.getProfessor().getId() : null,
            turma.getProfessor() != null ? turma.getProfessor().getNome() : null,
            turma.getAlunos() != null ? turma.getAlunos().size() : 0
        );
    }
}
