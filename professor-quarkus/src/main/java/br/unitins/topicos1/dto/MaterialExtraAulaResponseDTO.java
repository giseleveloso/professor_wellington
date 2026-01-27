package br.unitins.topicos1.dto;

import java.time.LocalDate;

import br.unitins.topicos1.model.MaterialExtraAula;
import br.unitins.topicos1.model.TipoConteudo;

public record MaterialExtraAulaResponseDTO(
    Long id,
    String titulo,
    TipoConteudo tipoConteudo,
    String descricao,
    String urlArquivo,
    String nomeArquivo,
    LocalDate dataPublicacao,
    Long idTurma,
    String nomeTurma,
    CategoriaVideoResponseDTO categoria,
    SubcategoriaVideoSimpleDTO subcategoria
) {
    public static MaterialExtraAulaResponseDTO valueOf(MaterialExtraAula material) {
        return new MaterialExtraAulaResponseDTO(
            material.getId(),
            material.getTitulo(),
            material.getTipoConteudo(),
            material.getDescricao(),
            material.getUrlArquivo(),
            material.getNomeArquivo(),
            material.getDataPublicacao(),
            material.getTurma() != null ? material.getTurma().getId() : null,
            material.getTurma() != null ? material.getTurma().getNome() : null,
            material.getCategoria() != null ? CategoriaVideoResponseDTO.valueOf(material.getCategoria()) : null,
            material.getSubcategoria() != null ? SubcategoriaVideoSimpleDTO.valueOf(material.getSubcategoria()) : null
        );
    }
}
