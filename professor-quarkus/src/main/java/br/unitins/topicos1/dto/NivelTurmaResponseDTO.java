package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.NivelTurma;

public record NivelTurmaResponseDTO(
    Long id,
    String codigo,
    String descricao,
    Integer ordem
) {
    public static NivelTurmaResponseDTO valueOf(NivelTurma nivel) {
        return new NivelTurmaResponseDTO(
            nivel.getId(),
            nivel.getCodigo(),
            nivel.getDescricao(),
            nivel.getOrdem()
        );
    }
}
