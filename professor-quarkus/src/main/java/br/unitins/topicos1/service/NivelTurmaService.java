package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.NivelTurmaDTO;
import br.unitins.topicos1.dto.NivelTurmaResponseDTO;

public interface NivelTurmaService {

    NivelTurmaResponseDTO create(NivelTurmaDTO dto, Long professorId);
    NivelTurmaResponseDTO update(Long id, NivelTurmaDTO dto);
    void delete(Long id);
    NivelTurmaResponseDTO findById(Long id);
    List<NivelTurmaResponseDTO> findByProfessorId(Long professorId);
    void criarNiveisPadrao(Long professorId);
    void reordenar(Long professorId, List<Long> ids);
}
