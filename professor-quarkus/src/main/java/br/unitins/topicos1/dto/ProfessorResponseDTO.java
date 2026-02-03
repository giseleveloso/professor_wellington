package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.ModoTenant;
import br.unitins.topicos1.model.Professor;

public record ProfessorResponseDTO(
    Long id,
    String nome,
    String email,
    String username,
    TelefoneResponseDTO telefone,
    EscolaResponseDTO escola,
    String modoTenant
) {
    public static ProfessorResponseDTO valueOf(Professor professor) {
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getUsuario() != null ? professor.getUsuario().getUsername() : null,
            professor.getTelefone() != null ? TelefoneResponseDTO.valueOf(professor.getTelefone()) : null,
            professor.getEscola() != null ? EscolaResponseDTO.valueOf(professor.getEscola()) : null,
            professor.getModoTenant() != null ? professor.getModoTenant().name() : ModoTenant.INDIVIDUAL.name()
        );
    }
}
