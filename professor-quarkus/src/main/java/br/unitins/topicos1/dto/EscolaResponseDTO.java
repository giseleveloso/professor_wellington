package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Escola;

public record EscolaResponseDTO(
    Long id,
    String nome,
    String descricao,
    Boolean ativo
) {
    public static EscolaResponseDTO valueOf(Escola escola) {
        if (escola == null) {
            return null;
        }
        return new EscolaResponseDTO(
            escola.getId(),
            escola.getNome(),
            escola.getDescricao(),
            escola.getAtivo()
        );
    }
}
