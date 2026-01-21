package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.CategoriaVideoDTO;
import br.unitins.topicos1.dto.CategoriaVideoResponseDTO;

public interface CategoriaVideoService {

    CategoriaVideoResponseDTO create(CategoriaVideoDTO dto);

    CategoriaVideoResponseDTO update(Long id, CategoriaVideoDTO dto);

    void delete(Long id);

    CategoriaVideoResponseDTO findById(Long id);

    List<CategoriaVideoResponseDTO> findAll();

    List<CategoriaVideoResponseDTO> findByNome(String nome);
}
