package br.unitins.topicos1.dto;

import java.time.LocalDate;

import br.unitins.topicos1.model.Presenca;

public record PresencaResponseDTO(
    Long id,
    Boolean presente,
    String observacao,
    Long idAula,
    LocalDate dataAula,
    String topicoAula,
    Long idAluno,
    String nomeAluno
) {
    public static PresencaResponseDTO valueOf(Presenca presenca) {
        return new PresencaResponseDTO(
            presenca.getId(),
            presenca.getPresente(),
            presenca.getObservacao(),
            presenca.getAula() != null ? presenca.getAula().getId() : null,
            presenca.getAula() != null ? presenca.getAula().getData() : null,
            presenca.getAula() != null ? presenca.getAula().getTopico() : null,
            presenca.getAluno() != null ? presenca.getAluno().getId() : null,
            presenca.getAluno() != null ? presenca.getAluno().getNome() : null
        );
    }
}
