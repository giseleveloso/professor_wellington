package br.unitins.topicos1.service;

import java.util.ArrayList;
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
import br.unitins.topicos1.util.TenantContext;
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

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public AlunoResponseDTO create(AlunoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        if (usuarioRepository.existsByUsername(dto.username())) {
            throw new ValidationException("username", "Username já existe");
        }

        // Senha é obrigatória para criação
        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new ValidationException("senha", "Senha é obrigatória");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(dto.username());
        usuario.setSenha(hashService.getHashSenha(dto.senha()));
        usuarioRepository.persist(usuario);

        Telefone telefone = null;
        if (dto.telefone() != null && dto.telefone().numero() != null && !dto.telefone().numero().isBlank()) {
            telefone = new Telefone();
            telefone.setCodigoArea(dto.telefone().codigoArea());
            telefone.setNumero(dto.telefone().numero());
            telefoneRepository.persist(telefone);
        }

        Telefone telefoneResponsavel = null;
        if (dto.telefoneResponsavel() != null && dto.telefoneResponsavel().numero() != null && !dto.telefoneResponsavel().numero().isBlank()) {
            telefoneResponsavel = new Telefone();
            telefoneResponsavel.setCodigoArea(dto.telefoneResponsavel().codigoArea());
            telefoneResponsavel.setNumero(dto.telefoneResponsavel().numero());
            telefoneRepository.persist(telefoneResponsavel);
        }

        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setDataNascimento(dto.dataNascimento());
        aluno.setUsuario(usuario);
        aluno.setTelefone(telefone);
        aluno.setTelefoneResponsavel(telefoneResponsavel);
        aluno.setObservacoes(dto.observacoes());

        // Múltiplas turmas - verificar se pertencem ao professor logado
        if (dto.idsTurmas() != null && !dto.idsTurmas().isEmpty()) {
            List<Turma> turmas = new ArrayList<>();
            for (Long turmaId : dto.idsTurmas()) {
                Turma turma = turmaRepository.findById(turmaId);
                if (turma != null) {
                    // Verificar se a turma pertence ao professor logado
                    if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                        throw new ValidationException("idsTurmas", "Turma não pertence ao professor logado");
                    }
                    turmas.add(turma);
                }
            }
            aluno.setTurmas(turmas);
            // Compatibilidade: define a primeira turma como turma principal
            if (!turmas.isEmpty()) {
                aluno.setTurma(turmas.get(0));
            }
        } else if (dto.idTurma() != null) {
            // Compatibilidade com turma única
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            // Verificar se a turma pertence ao professor logado
            if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
            }
            aluno.setTurma(turma);
        }

        alunoRepository.persist(aluno);
        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    @Transactional
    public AlunoResponseDTO update(Long id, AlunoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado (via turma principal)
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar este aluno");
        }

        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setDataNascimento(dto.dataNascimento());
        aluno.setObservacoes(dto.observacoes());

        // Atualiza senha se fornecida
        if (dto.senha() != null && !dto.senha().isBlank()) {
            aluno.getUsuario().setSenha(hashService.getHashSenha(dto.senha()));
        }

        // Múltiplas turmas - verificar se pertencem ao professor logado
        if (dto.idsTurmas() != null && !dto.idsTurmas().isEmpty()) {
            List<Turma> turmas = new ArrayList<>();
            for (Long turmaId : dto.idsTurmas()) {
                Turma turma = turmaRepository.findById(turmaId);
                if (turma != null) {
                    // Verificar se a turma pertence ao professor logado
                    if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                        throw new ValidationException("idsTurmas", "Turma não pertence ao professor logado");
                    }
                    turmas.add(turma);
                }
            }
            aluno.setTurmas(turmas);
            if (!turmas.isEmpty()) {
                aluno.setTurma(turmas.get(0));
            }
        } else if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            // Verificar se a turma pertence ao professor logado
            if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
            }
            aluno.setTurma(turma);
        }

        // Telefone do aluno
        if (dto.telefone() != null && dto.telefone().numero() != null && !dto.telefone().numero().isBlank()) {
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

        // Telefone do responsável
        if (dto.telefoneResponsavel() != null && dto.telefoneResponsavel().numero() != null && !dto.telefoneResponsavel().numero().isBlank()) {
            if (aluno.getTelefoneResponsavel() == null) {
                Telefone telefone = new Telefone();
                telefone.setCodigoArea(dto.telefoneResponsavel().codigoArea());
                telefone.setNumero(dto.telefoneResponsavel().numero());
                telefoneRepository.persist(telefone);
                aluno.setTelefoneResponsavel(telefone);
            } else {
                aluno.getTelefoneResponsavel().setCodigoArea(dto.telefoneResponsavel().codigoArea());
                aluno.getTelefoneResponsavel().setNumero(dto.telefoneResponsavel().numero());
            }
        }

        return AlunoResponseDTO.valueOf(aluno);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado (via turma principal)
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir este aluno");
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
        List<Aluno> alunos;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            alunos = alunoRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            alunos = alunoRepository.findByProfessorId(professor.getId());
        }
        return alunos.stream()
                .map(AlunoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AlunoResponseDTO> findByTurmaId(Long turmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return alunoRepository.findByTurmaIdIncluindoMultiplas(turmaId)
                .stream()
                .filter(a -> a.getTurma() != null &&
                        a.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(AlunoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AlunoResponseDTO> findByProfessorId(Long professorId) {
        List<Aluno> alunos;
        if (tenantContext.isSharedMode()) {
            alunos = alunoRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            alunos = alunoRepository.findByProfessorId(professorId);
        }
        return alunos.stream()
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
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para alterar a senha deste aluno");
        }

        aluno.getUsuario().setSenha(hashService.getHashSenha(novaSenha));
    }

    @Override
    @Transactional
    public void updateUsername(Long id, String novoUsername) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(id);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para alterar o username deste aluno");
        }

        if (usuarioRepository.existsByUsername(novoUsername)) {
            throw new ValidationException("username", "Username já existe");
        }
        aluno.getUsuario().setUsername(novoUsername);
    }

    @Override
    @Transactional
    public void transferirTurma(Long alunoId, Long novaTurmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(alunoId);
        if (aluno == null) {
            throw new ValidationException("id", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para transferir este aluno");
        }

        Turma turma = turmaRepository.findById(novaTurmaId);
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        // Verificar se a nova turma pertence ao professor logado
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
        }

        aluno.setTurma(turma);
    }
}
