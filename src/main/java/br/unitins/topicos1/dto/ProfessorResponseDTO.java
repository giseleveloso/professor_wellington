package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Professor;

public record ProfessorResponseDTO(
    Long id,
    String nome,
    String email,
    String username,
    TelefoneResponseDTO telefone
) {
    public static ProfessorResponseDTO valueOf(Professor professor) {
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getUsuario() != null ? professor.getUsuario().getUsername() : null,
            professor.getTelefone() != null ? TelefoneResponseDTO.valueOf(professor.getTelefone()) : null
        );
    }
}
