package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.TurmaDTO;
import br.unitins.topicos1.dto.TurmaResponseDTO;

public interface TurmaService {

    TurmaResponseDTO create(TurmaDTO dto);
    TurmaResponseDTO update(Long id, TurmaDTO dto);
    void delete(Long id);
    TurmaResponseDTO findById(Long id);
    List<TurmaResponseDTO> findAll();
    List<TurmaResponseDTO> findByProfessorId(Long professorId);
    List<TurmaResponseDTO> findByIdioma(Integer idIdioma);
    List<TurmaResponseDTO> findByNivelTurma(Long idNivelTurma);
    List<TurmaResponseDTO> findByNome(String nome);
}
