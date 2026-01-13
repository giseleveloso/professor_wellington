package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.DesempenhoDTO;
import br.unitins.topicos1.dto.DesempenhoResponseDTO;

public interface DesempenhoService {

    DesempenhoResponseDTO create(DesempenhoDTO dto);
    DesempenhoResponseDTO update(Long id, DesempenhoDTO dto);
    void delete(Long id);
    DesempenhoResponseDTO findById(Long id);
    List<DesempenhoResponseDTO> findByAulaId(Long aulaId);
    List<DesempenhoResponseDTO> findByAlunoId(Long alunoId);
    List<DesempenhoResponseDTO> findByAlunoIdParaAluno(Long alunoId);
    DesempenhoResponseDTO findByAulaIdAndAlunoId(Long aulaId, Long alunoId);
}
