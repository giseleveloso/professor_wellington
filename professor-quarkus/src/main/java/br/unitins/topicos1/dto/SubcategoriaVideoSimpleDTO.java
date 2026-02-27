package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.SubcategoriaVideo;

public record SubcategoriaVideoSimpleDTO(
    Long id,
    String nome,
    String descricao,
    Integer nivel
) {
    public static SubcategoriaVideoSimpleDTO valueOf(SubcategoriaVideo subcategoria) {
        return new SubcategoriaVideoSimpleDTO(
            subcategoria.getId(),
            subcategoria.getNome(),
            subcategoria.getDescricao(),
            subcategoria.getNivel()
        );
    }
}
