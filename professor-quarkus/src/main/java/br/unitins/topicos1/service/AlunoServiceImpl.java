package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.AlunoDTO;
import br.unitins.topicos1.dto.AlunoResponseDTO;
import br.unitins.topicos1.dto.UsuarioResponseDTO;
import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Telefone;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.model.Usuario;
import br.unitins.topicos1.repository.AlunoRepository;
import br.unitins.topicos1.repository.TelefoneRepository;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.repository.UsuarioRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AlunoServiceImpl implements AlunoService {

    @Inject
    AlunoRepository alunoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    TelefoneRepository telefoneRepository;

    @Inject
    TurmaRepository turmaRepository;

    @Inject
    HashService hashService;

    @Override
    @Transactional
    public AlunoResponseDTO create(AlunoDTO dto) {
        if (usuarioRepository.existsByUsername(dto.username())) {
            throw new ValidationException("username", "Username já existe");
        }

        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
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

        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setUsuario(usuario);
        aluno.setTelefone(telefone);
        aluno.setTurma(turma);

        alunoRepository.persist(aluno);
        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    @Transactional
    public AlunoResponseDTO update(Long id, AlunoDTO dto) {
        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());

        if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            aluno.setTurma(turma);
        }

        if (dto.telefone() != null) {
            if (aluno.getTelefone() == null) {
                Telefone telefone = new Telefone();
                telefone.setCodigoArea(dto.telefone().codigoArea());
                telefone.setNumero(dto.telefone().numero());
                telefoneRepository.persist(telefone);
                aluno.setTelefone(telefone);
            } else {
                aluno.getTelefone().setCodigoArea(dto.telefone().codigoArea());
                aluno.getTelefone().setNumero(dto.telefone().numero());
            }
        }

        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }
        alunoRepository.delete(aluno);
    }

    @Override
    public AlunoResponseDTO findById(Long id) {
        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }
        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    public List<AlunoResponseDTO> findAll() {
        return alunoRepository.listAll()
                .stream()
                .map(AlunoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AlunoResponseDTO> findByTurmaId(Long turmaId) {
        return alunoRepository.findByTurmaId(turmaId)
                .stream()
                .map(AlunoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AlunoResponseDTO> findByProfessorId(Long professorId) {
        return alunoRepository.findByProfessorId(professorId)
                .stream()
                .map(AlunoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public AlunoResponseDTO findByUsername(String username) {
        Aluno aluno = alunoRepository.findByUsername(username);
        if (aluno == null) {
            return null;
        }
        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    public UsuarioResponseDTO login(String username, String senhaHash) {
        Aluno aluno = alunoRepository.findByUsername(username);
        if (aluno != null && aluno.getUsuario().getSenha().equals(senhaHash)) {
            return new UsuarioResponseDTO(aluno.getUsuario().getUsername(), aluno.getNome());
        }
        return null;
    }

    @Override
    @Transactional
    public void updatePassword(Long id, String novaSenha) {
        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }
        aluno.getUsuario().setSenha(hashService.getHashSenha(novaSenha));
    }

    @Override
    @Transactional
    public void updateUsername(Long id, String novoUsername) {
        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }
        if (usuarioRepository.existsByUsername(novoUsername)) {
            throw new ValidationException("username", "Username já existe");
        }
        aluno.getUsuario().setUsername(novoUsername);
    }

    @Override
    @Transactional
    public void transferirTurma(Long alunoId, Long novaTurmaId) {
        Aluno aluno = alunoRepository.findById(alunoId);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }
        Turma turma = turmaRepository.findById(novaTurmaId);
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }
        aluno.setTurma(turma);
    }
}
