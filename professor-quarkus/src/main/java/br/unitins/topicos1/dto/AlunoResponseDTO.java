package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Aluno;

public record AlunoResponseDTO(
    Long id,
    String nome,
    String email,
    String username,
    TelefoneResponseDTO telefone,
    Long idTurma,
    String nomeTurma
) {
    public static AlunoResponseDTO valueOf(Aluno aluno) {
        return new AlunoResponseDTO(
            aluno.getId(),
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getUsuario() != null ? aluno.getUsuario().getUsername() : null,
            aluno.getTelefone() != null ? TelefoneResponseDTO.valueOf(aluno.getTelefone()) : null,
            aluno.getTurma() != null ? aluno.getTurma().getId() : null,
            aluno.getTurma() != null ? aluno.getTurma().getNome() : null
        );
    }
}
