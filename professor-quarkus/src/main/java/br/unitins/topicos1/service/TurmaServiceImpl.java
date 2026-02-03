package br.unitins.topicos1.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.HorarioDiaDTO;
import br.unitins.topicos1.dto.TurmaDTO;
import br.unitins.topicos1.dto.TurmaResponseDTO;
import br.unitins.topicos1.model.HorarioDia;
import br.unitins.topicos1.model.Idioma;
import br.unitins.topicos1.model.NivelTurma;
import br.unitins.topicos1.model.Professor;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.repository.HorarioDiaRepository;
import br.unitins.topicos1.repository.NivelTurmaRepository;
import br.unitins.topicos1.repository.ProfessorRepository;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.util.TenantContext;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TurmaServiceImpl implements TurmaService {

    @Inject
    TurmaRepository turmaRepository;

    @Inject
    ProfessorRepository professorRepository;

    @Inject
    NivelTurmaRepository nivelTurmaRepository;

    @Inject
    HorarioDiaRepository horarioDiaRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public TurmaResponseDTO create(TurmaDTO dto) {
        // Usar o professor logado do TenantContext
        Professor professor = tenantContext.getCurrentProfessor();
        if (professor == null) {
            throw new ValidationException("professor", "Professor não encontrado");
        }

        Turma turma = new Turma();
        turma.setNome(dto.nome());
        turma.setDescricao(dto.descricao());
        turma.setCor(dto.cor());
        turma.setIdioma(Idioma.valueOf(dto.idIdioma()));

        // Nível da turma
        if (dto.idNivelTurma() != null) {
            NivelTurma nivelTurma = nivelTurmaRepository.findById(dto.idNivelTurma());
            if (nivelTurma == null) {
                throw new ValidationException("idNivelTurma", "Nível não encontrado");
            }
            turma.setNivelTurma(nivelTurma);
        }

        turma.setHorario(dto.horario());
        turma.setDiasSemana(dto.diasSemana());
        turma.setProfessor(professor);
        if (tenantContext.isSharedMode()) {
            turma.setEscola(tenantContext.getCurrentEscola());
        }

        turmaRepository.persist(turma);

        // Horários por dia
        if (dto.horariosPorDia() != null && !dto.horariosPorDia().isEmpty()) {
            List<HorarioDia> horarios = new ArrayList<>();
            for (HorarioDiaDTO h : dto.horariosPorDia()) {
                HorarioDia horario = new HorarioDia();
                horario.setDiaSemana(h.diaSemana());
                horario.setDiaNome(h.diaNome());
                horario.setHoraInicio(h.horaInicio());
                horario.setHoraFim(h.horaFim());
                horario.setTurma(turma);
                horarioDiaRepository.persist(horario);
                horarios.add(horario);
            }
            turma.setHorariosPorDia(horarios);
        }

        return TurmaResponseDTO.valueOf(turma);
    }

    @Override
    @Transactional
    public TurmaResponseDTO update(Long id, TurmaDTO dto) {
        Turma turma = turmaRepository.findById(id);
        if (turma == null) {
            throw new ValidationException("id", "Turma não encontrada");
        }

        // Verificar se a turma pertence ao professor logado
        Professor professorLogado = tenantContext.getCurrentProfessor();
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar esta turma");
        }

        turma.setNome(dto.nome());
        turma.setDescricao(dto.descricao());
        turma.setCor(dto.cor());
        turma.setIdioma(Idioma.valueOf(dto.idIdioma()));

        // Nível da turma
        if (dto.idNivelTurma() != null && dto.idNivelTurma() > 0) {
            NivelTurma nivelTurma = nivelTurmaRepository.findById(dto.idNivelTurma());
            if (nivelTurma != null) {
                turma.setNivelTurma(nivelTurma);
            }
        }

        turma.setHorario(dto.horario());
        turma.setDiasSemana(dto.diasSemana());

        // Não permitir trocar o professor da turma
        // turma.setProfessor permanece o mesmo

        // Atualizar horários por dia - NÃO substituir a lista, apenas modificá-la
        // (necessário por causa do orphanRemoval = true)
        if (turma.getHorariosPorDia() == null) {
            turma.setHorariosPorDia(new ArrayList<>());
        } else {
            turma.getHorariosPorDia().clear();
        }
        
        if (dto.horariosPorDia() != null && !dto.horariosPorDia().isEmpty()) {
            for (HorarioDiaDTO h : dto.horariosPorDia()) {
                HorarioDia horario = new HorarioDia();
                horario.setDiaSemana(h.diaSemana());
                horario.setDiaNome(h.diaNome());
                horario.setHoraInicio(h.horaInicio());
                horario.setHoraFim(h.horaFim());
                horario.setTurma(turma);
                turma.getHorariosPorDia().add(horario);  // Adiciona na lista existente
            }
        }

        return TurmaResponseDTO.valueOf(turma);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Turma turma = turmaRepository.findById(id);
        if (turma == null) {
            throw new ValidationException("id", "Turma não encontrada");
        }

        // Verificar se a turma pertence ao professor logado
        Professor professorLogado = tenantContext.getCurrentProfessor();
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir esta turma");
        }

        horarioDiaRepository.deleteByTurmaId(id);
        turmaRepository.delete(turma);
    }

    @Override
    public TurmaResponseDTO findById(Long id) {
        Turma turma = turmaRepository.findById(id);
        if (turma == null) {
            throw new ValidationException("id", "Turma não encontrada");
        }
        return TurmaResponseDTO.valueOf(turma);
    }

    @Override
    public List<TurmaResponseDTO> findAll() {
        List<Turma> turmas;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            turmas = turmaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            turmas = turmaRepository.findByProfessorId(professor.getId());
        }
        return turmas.stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByProfessorId(Long professorId) {
        List<Turma> turmas;
        if (tenantContext.isSharedMode()) {
            turmas = turmaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            turmas = turmaRepository.findByProfessorId(professorId);
        }
        return turmas.stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByIdioma(Integer idIdioma) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return turmaRepository.findByIdioma(Idioma.valueOf(idIdioma))
                .stream()
                .filter(t -> t.getProfessor().getId().equals(professorLogado.getId()))
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByNivelTurma(Long idNivelTurma) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return turmaRepository.findByNivelTurma(idNivelTurma)
                .stream()
                .filter(t -> t.getProfessor().getId().equals(professorLogado.getId()))
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByNome(String nome) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return turmaRepository.findByNome(nome)
                .stream()
                .filter(t -> t.getProfessor().getId().equals(professorLogado.getId()))
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
