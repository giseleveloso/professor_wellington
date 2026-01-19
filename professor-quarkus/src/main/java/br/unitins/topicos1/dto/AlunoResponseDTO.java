package br.unitins.topicos1.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.model.Aluno;

public record AlunoResponseDTO(
    Long id,
    String nome,
    String email,
    String username,
    LocalDate dataNascimento,
    TelefoneResponseDTO telefone,
    TelefoneResponseDTO telefoneResponsavel,
    Long idTurma,
    String nomeTurma,
    List<TurmaSimpleDTO> turmas
) {
    public static AlunoResponseDTO valueOf(Aluno aluno) {
        List<TurmaSimpleDTO> turmasList = null;
        if (aluno.getTurmas() != null && !aluno.getTurmas().isEmpty()) {
            turmasList = aluno.getTurmas().stream()
                .map(TurmaSimpleDTO::valueOf)
                .collect(Collectors.toList());
        }
        
        return new AlunoResponseDTO(
            aluno.getId(),
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getUsuario() != null ? aluno.getUsuario().getUsername() : null,
            aluno.getDataNascimento(),
            aluno.getTelefone() != null ? TelefoneResponseDTO.valueOf(aluno.getTelefone()) : null,
            aluno.getTelefoneResponsavel() != null ? TelefoneResponseDTO.valueOf(aluno.getTelefoneResponsavel()) : null,
            aluno.getTurma() != null ? aluno.getTurma().getId() : null,
            aluno.getTurma() != null ? aluno.getTurma().getNome() : null,
            turmasList
        );
    }
}
