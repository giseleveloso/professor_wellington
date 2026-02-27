package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.MaterialExtraAulaDTO;
import br.unitins.topicos1.dto.MaterialExtraAulaResponseDTO;

public interface MaterialExtraAulaService {

    MaterialExtraAulaResponseDTO create(MaterialExtraAulaDTO dto);
    MaterialExtraAulaResponseDTO update(Long id, MaterialExtraAulaDTO dto);
    void delete(Long id);
    MaterialExtraAulaResponseDTO findById(Long id);
    List<MaterialExtraAulaResponseDTO> findAll();
    List<MaterialExtraAulaResponseDTO> findByTurmaId(Long turmaId);
    List<MaterialExtraAulaResponseDTO> findByTipoConteudo(Integer idTipoConteudo);
    List<MaterialExtraAulaResponseDTO> findByTurmaIdAndTipoConteudo(Long turmaId, Integer idTipoConteudo);
    List<MaterialExtraAulaResponseDTO> findByTitulo(String titulo);
    List<MaterialExtraAulaResponseDTO> findByCategoria(Long idCategoria);
    List<MaterialExtraAulaResponseDTO> findBySubcategoria(Long idSubcategoria);
    List<MaterialExtraAulaResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Long idCategoria);
    List<MaterialExtraAulaResponseDTO> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria);
}
