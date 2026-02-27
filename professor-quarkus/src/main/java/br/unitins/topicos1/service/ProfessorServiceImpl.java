package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.ProfessorDTO;
import br.unitins.topicos1.dto.ProfessorResponseDTO;
import br.unitins.topicos1.dto.UsuarioResponseDTO;
import br.unitins.topicos1.model.Professor;
import br.unitins.topicos1.model.Telefone;
import br.unitins.topicos1.model.Usuario;
import br.unitins.topicos1.repository.ProfessorRepository;
import br.unitins.topicos1.repository.TelefoneRepository;
import br.unitins.topicos1.repository.UsuarioRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ProfessorServiceImpl implements ProfessorService {

    @Inject
    ProfessorRepository professorRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    TelefoneRepository telefoneRepository;

    @Inject
    HashService hashService;

    @Override
    @Transactional
    public ProfessorResponseDTO create(ProfessorDTO dto) {
        if (usuarioRepository.existsByUsername(dto.username())) {
            throw new ValidationException("username", "Username já existe");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(dto.username());
        usuario.setSenha(hashService.getHashSenha(dto.senha()));
        usuarioRepository.persist(usuario);

        Telefone telefone = null;
        if (dto.telefone() != null) {
            telefone = new Telefone();
            telefone.setCodigoArea(dto.telefone().codigoArea());
            telefone.setNumero(dto.telefone().numero());
            telefoneRepository.persist(telefone);
        }

        Professor professor = new Professor();
        professor.setNome(dto.nome());
        professor.setEmail(dto.email());
        professor.setUsuario(usuario);
        professor.setTelefone(telefone);

        professorRepository.persist(professor);
        return ProfessorResponseDTO.valueOf(professor);
    }

    @Override
    @Transactional
    public ProfessorResponseDTO update(Long id, ProfessorDTO dto) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) {
            throw new ValidationException("id", "Professor não encontrado");
        }

        professor.setNome(dto.nome());
        professor.setEmail(dto.email());

        if (dto.telefone() != null) {
            if (professor.getTelefone() == null) {
                Telefone telefone = new Telefone();
                telefone.setCodigoArea(dto.telefone().codigoArea());
                telefone.setNumero(dto.telefone().numero());
                telefoneRepository.persist(telefone);
                professor.setTelefone(telefone);
            } else {
                professor.getTelefone().setCodigoArea(dto.telefone().codigoArea());
                professor.getTelefone().setNumero(dto.telefone().numero());
            }
        }

        return ProfessorResponseDTO.valueOf(professor);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) {
            throw new ValidationException("id", "Professor não encontrado");
        }
        professorRepository.delete(professor);
    }

    @Override
    public ProfessorResponseDTO findById(Long id) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) {
            throw new ValidationException("id", "Professor não encontrado");
        }
        return ProfessorResponseDTO.valueOf(professor);
    }

    @Override
    public List<ProfessorResponseDTO> findAll() {
        return professorRepository.listAll()
                .stream()
                .map(ProfessorResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public ProfessorResponseDTO findByUsername(String username) {
        Professor professor = professorRepository.findByUsername(username);
        if (professor == null) {
            return null;
        }
        return ProfessorResponseDTO.valueOf(professor);
    }

    @Override
    public UsuarioResponseDTO login(String username, String senhaHash) {
        Professor professor = professorRepository.findByUsername(username);
        if (professor != null && professor.getUsuario().getSenha().equals(senhaHash)) {
            return new UsuarioResponseDTO(professor.getUsuario().getUsername(), professor.getNome());
        }
        return null;
    }

    @Override
    @Transactional
    public void updatePassword(Long id, String novaSenha) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) {
            throw new ValidationException("id", "Professor não encontrado");
        }
        professor.getUsuario().setSenha(hashService.getHashSenha(novaSenha));
    }

    @Override
    @Transactional
    public void updateUsername(Long id, String novoUsername) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) {
            throw new ValidationException("id", "Professor não encontrado");
        }
        if (usuarioRepository.existsByUsername(novoUsername)) {
            throw new ValidationException("username", "Username já existe");
        }
        professor.getUsuario().setUsername(novoUsername);
    }
}
