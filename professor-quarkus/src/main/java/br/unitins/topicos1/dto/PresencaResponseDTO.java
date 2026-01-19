package br.unitins.topicos1.dto;

import java.time.LocalDate;

import br.unitins.topicos1.model.Presenca;

public record PresencaResponseDTO(
    Long id,
    Boolean presente,
    String status,
    String deverCasa,
    String preparacaoAula,
    String comentario,
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
            presenca.getStatus() != null ? presenca.getStatus().getLabel() : null,
            presenca.getDeverCasa() != null ? presenca.getDeverCasa().getLabel() : null,
            presenca.getPreparacaoAula() != null ? presenca.getPreparacaoAula().getLabel() : null,
            presenca.getComentario(),
            presenca.getObservacao(),
            presenca.getAula() != null ? presenca.getAula().getId() : null,
            presenca.getAula() != null ? presenca.getAula().getData() : null,
            presenca.getAula() != null ? presenca.getAula().getTopico() : null,
            presenca.getAluno() != null ? presenca.getAluno().getId() : null,
            presenca.getAluno() != null ? presenca.getAluno().getNome() : null
        );
    }
}
