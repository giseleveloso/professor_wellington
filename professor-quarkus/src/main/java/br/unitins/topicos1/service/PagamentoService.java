package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.PagamentoDTO;
import br.unitins.topicos1.dto.PagamentoResponseDTO;

public interface PagamentoService {

    PagamentoResponseDTO create(PagamentoDTO dto);
    PagamentoResponseDTO update(Long id, PagamentoDTO dto);
    void delete(Long id);
    PagamentoResponseDTO findById(Long id);
    List<PagamentoResponseDTO> findAll();
    List<PagamentoResponseDTO> findByAlunoId(Long alunoId);
    List<PagamentoResponseDTO> findByStatus(Integer idStatus);
    List<PagamentoResponseDTO> findByMesAno(String mes, Integer ano);
    List<PagamentoResponseDTO> findPendentesVencidos();
    List<PagamentoResponseDTO> findByTurmaId(Long turmaId);
    List<PagamentoResponseDTO> findByProfessorId(Long professorId);
    void marcarComoPago(Long id);
    void atualizarStatusVencidos();
}
