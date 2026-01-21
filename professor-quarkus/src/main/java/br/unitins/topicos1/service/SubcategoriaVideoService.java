package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.SubcategoriaVideoDTO;
import br.unitins.topicos1.dto.SubcategoriaVideoResponseDTO;

public interface SubcategoriaVideoService {

    SubcategoriaVideoResponseDTO create(SubcategoriaVideoDTO dto);

    SubcategoriaVideoResponseDTO update(Long id, SubcategoriaVideoDTO dto);

    void delete(Long id);

    SubcategoriaVideoResponseDTO findById(Long id);

    List<SubcategoriaVideoResponseDTO> findAll();

    List<SubcategoriaVideoResponseDTO> findByCategoriaRaiz(Long idCategoriaRaiz);

    List<SubcategoriaVideoResponseDTO> findBySubcategoriaPai(Long idSubcategoriaPai);

    List<SubcategoriaVideoResponseDTO> findRaizes(Long idCategoriaRaiz);

    List<SubcategoriaVideoResponseDTO> findByNome(String nome);
}
