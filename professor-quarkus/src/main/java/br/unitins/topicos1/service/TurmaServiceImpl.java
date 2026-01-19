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

    @Override
    @Transactional
    public TurmaResponseDTO create(TurmaDTO dto) {
        Professor professor = professorRepository.findById(dto.idProfessor());
        if (professor == null) {
            throw new ValidationException("idProfessor", "Professor não encontrado");
        }

        Turma turma = new Turma();
        turma.setNome(dto.nome());
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

        turma.setNome(dto.nome());
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

        if (dto.idProfessor() != null) {
            Professor professor = professorRepository.findById(dto.idProfessor());
            if (professor == null) {
                throw new ValidationException("idProfessor", "Professor não encontrado");
            }
            turma.setProfessor(professor);
        }

        // Atualizar horários por dia
        if (dto.horariosPorDia() != null) {
            // Remove horários antigos
            horarioDiaRepository.deleteByTurmaId(id);
            
            // Cria novos
            if (!dto.horariosPorDia().isEmpty()) {
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
        return turmaRepository.listAll()
                .stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByProfessorId(Long professorId) {
        return turmaRepository.findByProfessorId(professorId)
                .stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByIdioma(Integer idIdioma) {
        return turmaRepository.findByIdioma(Idioma.valueOf(idIdioma))
                .stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByNivelTurma(Long idNivelTurma) {
        return turmaRepository.findByNivelTurma(idNivelTurma)
                .stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<TurmaResponseDTO> findByNome(String nome) {
        return turmaRepository.findByNome(nome)
                .stream()
                .map(TurmaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
