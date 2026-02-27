package br.unitins.topicos1.dto;

import java.util.List;

import br.unitins.topicos1.model.SubcategoriaVideo;

public record SubcategoriaVideoResponseDTO(
    Long id,
    String nome,
    String descricao,
    CategoriaVideoResponseDTO categoriaRaiz,
    Long idSubcategoriaPai,
    String nomeSubcategoriaPai,
    Integer nivel,
    List<SubcategoriaVideoSimpleDTO> subcategoriasFilhas
) {
    public static SubcategoriaVideoResponseDTO valueOf(SubcategoriaVideo subcategoria) {
        return new SubcategoriaVideoResponseDTO(
            subcategoria.getId(),
            subcategoria.getNome(),
            subcategoria.getDescricao(),
            subcategoria.getCategoriaRaiz() != null ? CategoriaVideoResponseDTO.valueOf(subcategoria.getCategoriaRaiz()) : null,
            subcategoria.getSubcategoriaPai() != null ? subcategoria.getSubcategoriaPai().getId() : null,
            subcategoria.getSubcategoriaPai() != null ? subcategoria.getSubcategoriaPai().getNome() : null,
            subcategoria.getNivel(),
            subcategoria.getSubcategoriasFilhas() != null
                ? subcategoria.getSubcategoriasFilhas().stream()
                    .map(SubcategoriaVideoSimpleDTO::valueOf)
                    .toList()
                : null
        );
    }
}
