package br.unitins.topicos1.dto;

import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.Video;

public record VideoResponseDTO(
    Long id,
    String titulo,
    String linkYoutube,
    String descricao,
    CategoriaVideo categoria,
    Long idTurma,
    String nomeTurma
) {
    public static VideoResponseDTO valueOf(Video video) {
        return new VideoResponseDTO(
            video.getId(),
            video.getTitulo(),
            video.getLinkYoutube(),
            video.getDescricao(),
            video.getCategoria(),
            video.getTurma() != null ? video.getTurma().getId() : null,
            video.getTurma() != null ? video.getTurma().getNome() : null
        );
    }
}
