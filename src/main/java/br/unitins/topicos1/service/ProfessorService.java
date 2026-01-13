package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.ProfessorDTO;
import br.unitins.topicos1.dto.ProfessorResponseDTO;
import br.unitins.topicos1.dto.UsuarioResponseDTO;

public interface ProfessorService {

    ProfessorResponseDTO create(ProfessorDTO dto);
    ProfessorResponseDTO update(Long id, ProfessorDTO dto);
    void delete(Long id);
    ProfessorResponseDTO findById(Long id);
    List<ProfessorResponseDTO> findAll();
    ProfessorResponseDTO findByUsername(String username);
    UsuarioResponseDTO login(String username, String senhaHash);
    void updatePassword(Long id, String novaSenha);
    void updateUsername(Long id, String novoUsername);
}
