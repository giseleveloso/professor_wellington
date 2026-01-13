package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Professor;

public record UsuarioResponseDTO(
    String username,
    String nome
) {
    public static UsuarioResponseDTO valueOf(Professor professor) {
        return new UsuarioResponseDTO(
                professor.getUsuario().getUsername(),
                professor.getNome()
            );
    }

    public static UsuarioResponseDTO valueOf(Aluno aluno) {
        return new UsuarioResponseDTO(
                aluno.getUsuario().getUsername(),
                aluno.getNome()
            );
    }
}
