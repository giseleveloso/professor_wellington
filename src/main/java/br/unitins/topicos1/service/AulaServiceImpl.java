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

    @Override
    @Transactional
    public AulaResponseDTO create(AulaDTO dto) {
        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
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
        Aula aula = aulaRepository.findById(id);
        if (aula == null) {
            throw new ValidationException("id", "Aula não encontrada");
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
            aula.setTurma(turma);
        }

        return AulaResponseDTO.valueOf(aula);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Aula aula = aulaRepository.findById(id);
        if (aula == null) {
            throw new ValidationException("id", "Aula não encontrada");
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
        return aulaRepository.listAll()
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByTurmaId(Long turmaId) {
        return aulaRepository.findByTurmaId(turmaId)
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByData(LocalDate data) {
        return aulaRepository.findByData(data)
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByTurmaIdAndPeriodo(Long turmaId, LocalDate inicio, LocalDate fim) {
        return aulaRepository.findByTurmaIdAndPeriodo(turmaId, inicio, fim)
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByProfessorId(Long professorId) {
        return aulaRepository.findByProfessorId(professorId)
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<AulaResponseDTO> findByProfessorIdAndData(Long professorId, LocalDate data) {
        return aulaRepository.findByProfessorIdAndData(professorId, data)
                .stream()
                .map(AulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
