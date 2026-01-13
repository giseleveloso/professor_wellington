package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.PresencaDTO;
import br.unitins.topicos1.dto.PresencaResponseDTO;

public interface PresencaService {

    PresencaResponseDTO create(PresencaDTO dto);
    PresencaResponseDTO update(Long id, PresencaDTO dto);
    void delete(Long id);
    PresencaResponseDTO findById(Long id);
    List<PresencaResponseDTO> findByAulaId(Long aulaId);
    List<PresencaResponseDTO> findByAlunoId(Long alunoId);
    PresencaResponseDTO findByAulaIdAndAlunoId(Long aulaId, Long alunoId);
    void registrarPresencaEmLote(Long aulaId, List<PresencaDTO> presencas);
    long countPresencasByAlunoId(Long alunoId);
    long countFaltasByAlunoId(Long alunoId);
}
