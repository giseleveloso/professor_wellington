package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.CategoriaVideo;

public record CategoriaVideoResponseDTO(
    Long id,
    String nome,
    String descricao,
    String cor
) {
    public static CategoriaVideoResponseDTO valueOf(CategoriaVideo categoria) {
        return new CategoriaVideoResponseDTO(
            categoria.getId(),
            categoria.getNome(),
            categoria.getDescricao(),
            categoria.getCor()
        );
    }
}
