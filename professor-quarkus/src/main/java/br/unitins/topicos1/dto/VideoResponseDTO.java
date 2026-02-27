package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.Video;

public record VideoResponseDTO(
    Long id,
    String titulo,
    String linkYoutube,
    String descricao,
    CategoriaVideoResponseDTO categoria,
    SubcategoriaVideoSimpleDTO subcategoria,
    Long idTurma,
    String nomeTurma
) {
    public static VideoResponseDTO valueOf(Video video) {
        return new VideoResponseDTO(
            video.getId(),
            video.getTitulo(),
            video.getLinkYoutube(),
            video.getDescricao(),
            video.getCategoria() != null ? CategoriaVideoResponseDTO.valueOf(video.getCategoria()) : null,
            video.getSubcategoria() != null ? SubcategoriaVideoSimpleDTO.valueOf(video.getSubcategoria()) : null,
            video.getTurma() != null ? video.getTurma().getId() : null,
            video.getTurma() != null ? video.getTurma().getNome() : null
        );
    }
}
