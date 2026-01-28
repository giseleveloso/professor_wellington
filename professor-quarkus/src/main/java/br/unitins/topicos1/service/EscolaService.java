package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.EscolaDTO;
import br.unitins.topicos1.dto.EscolaResponseDTO;

public interface EscolaService {

    EscolaResponseDTO create(EscolaDTO dto);
    EscolaResponseDTO update(Long id, EscolaDTO dto);
    void delete(Long id);
    EscolaResponseDTO findById(Long id);
    List<EscolaResponseDTO> findAll();
    List<EscolaResponseDTO> findAllAtivas();
    void ativarDesativar(Long id, boolean ativo);
    void adicionarProfessor(Long escolaId, Long professorId);
    void removerProfessor(Long professorId);
}
