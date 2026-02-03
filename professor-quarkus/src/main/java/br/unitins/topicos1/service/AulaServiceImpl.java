package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.AulaDTO;
import br.unitins.topicos1.dto.AulaResponseDTO;
import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.repository.AulaRepository;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.util.TenantContext;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AulaServiceImpl implements AulaService {

    @Inject
    AulaRepository aulaRepository;

    @Inject
    TurmaRepository turmaRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public AulaResponseDTO create(AulaDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        // Verificar se a turma pertence ao professor logado
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
        }

        Aula aula = new Aula();
        aula.setData(dto.data());
        aula.setHoraInicio(dto.horaInicio());
        aula.setHoraFim(dto.horaFim());
        aula.setTopico(dto.topico());
        aula.setDescricao(dto.descricao());
        aula.setDuracaoMinutos(dto.duracaoMinutos());
        aula.setTurma(turma);

        aulaRepository.persist(aula);
        return AulaResponseDTO.valueOf(aula);
    }

    @Override
    @Transactional
    public AulaResponseDTO update(Long id, AulaDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aula aula = aulaRepository.findById(id);
        if (aula == null) {
            throw new ValidationException("id", "Aula não encontrada");
        }

        // Verificar se a aula pertence ao professor logado (via turma)
        if (!aula.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar esta aula");
        }

        aula.setData(dto.data());
        aula.setHoraInicio(dto.horaInicio());
        aula.setHoraFim(dto.horaFim());
        aula.setTopico(dto.topico());
        aula.setDescricao(dto.descricao());
        aula.setDuracaoMinutos(dto.duracaoMinutos());

        if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            // Verificar se a nova turma pertence ao professor logado
            if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
            }
            aula.setTurma(turma);
        }

        return AulaResponseDTO.valueOf(aula);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aula aula = aulaRepository.findById(id);
        if (aula == null) {
            throw new ValidationException("id", "Aula não encontrada");
        }

        // Verificar se a aula pertence ao professor logado (via turma)
        if (!aula.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir esta aula");
        }

        aulaRepository.delete(aula);
    }

    @Override
    public AulaResponseDTO findById(Long id) {
        Aula aula = aulaRepository.findById(id);
        if (aula == null) {
            throw new ValidationException("id", "Aula não encontrada");
        }
        return AulaResponseDTO.valueOf(aula);
    }

    @Override
    public List<AulaResponseDTO> findAll() {
        List<Aula> aulas;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            aulas = aulaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            aulas = aulaRepository.findByProfessorId(professor.getId());
        }
        return aulas.stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByTurmaId(Long turmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return aulaRepository.findByTurmaId(turmaId)
                .stream()
                .filter(a -> a.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByData(LocalDate data) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return aulaRepository.findByData(data)
                .stream()
                .filter(a -> a.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByTurmaIdAndPeriodo(Long turmaId, LocalDate inicio, LocalDate fim) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return aulaRepository.findByTurmaIdAndPeriodo(turmaId, inicio, fim)
                .stream()
                .filter(a -> a.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByProfessorId(Long professorId) {
        List<Aula> aulas;
        if (tenantContext.isSharedMode()) {
            aulas = aulaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            aulas = aulaRepository.findByProfessorId(professorId);
        }
        return aulas.stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByProfessorIdAndData(Long professorId, LocalDate data) {
        List<Aula> aulas;
        if (tenantContext.isSharedMode()) {
            aulas = aulaRepository.findByEscolaIdAndData(tenantContext.getCurrentEscola().getId(), data);
        } else {
            aulas = aulaRepository.findByProfessorIdAndData(professorId, data);
        }
        return aulas.stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
