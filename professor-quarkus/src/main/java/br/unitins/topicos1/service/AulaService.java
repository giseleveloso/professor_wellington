package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.util.List;

import br.unitins.topicos1.dto.AulaDTO;
import br.unitins.topicos1.dto.AulaResponseDTO;

public interface AulaService {

    AulaResponseDTO create(AulaDTO dto);
    AulaResponseDTO update(Long id, AulaDTO dto);
    void delete(Long id);
    AulaResponseDTO findById(Long id);
    List<AulaResponseDTO> findAll();
    List<AulaResponseDTO> findByTurmaId(Long turmaId);
    List<AulaResponseDTO> findByData(LocalDate data);
    List<AulaResponseDTO> findByTurmaIdAndPeriodo(Long turmaId, LocalDate inicio, LocalDate fim);
    List<AulaResponseDTO> findByProfessorId(Long professorId);
    List<AulaResponseDTO> findByProfessorIdAndData(Long professorId, LocalDate data);
    List<AulaResponseDTO> findByPeriodo(LocalDate inicio, LocalDate fim);
}
