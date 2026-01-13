package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.AlunoDTO;
import br.unitins.topicos1.dto.AlunoResponseDTO;
import br.unitins.topicos1.dto.UsuarioResponseDTO;

public interface AlunoService {

    AlunoResponseDTO create(AlunoDTO dto);
    AlunoResponseDTO update(Long id, AlunoDTO dto);
    void delete(Long id);
    AlunoResponseDTO findById(Long id);
    List<AlunoResponseDTO> findAll();
    List<AlunoResponseDTO> findByTurmaId(Long turmaId);
    List<AlunoResponseDTO> findByProfessorId(Long professorId);
    AlunoResponseDTO findByUsername(String username);
    UsuarioResponseDTO login(String username, String senhaHash);
    void updatePassword(Long id, String novaSenha);
    void updateUsername(Long id, String novoUsername);
    void transferirTurma(Long alunoId, Long novaTurmaId);
}
