package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.TurmaDTO;
import br.unitins.topicos1.dto.TurmaResponseDTO;
import br.unitins.topicos1.model.Idioma;
import br.unitins.topicos1.model.Nivel;
import br.unitins.topicos1.model.Professor;
import br.unitins.topicos1.model.Turma;
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
        turma.setNivel(Nivel.valueOf(dto.idNivel()));
        turma.setHorario(dto.horario());
        turma.setDiasSemana(dto.diasSemana());
        turma.setProfessor(professor);

        turmaRepository.persist(turma);
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
        turma.setNivel(Nivel.valueOf(dto.idNivel()));
        turma.setHorario(dto.horario());
        turma.setDiasSemana(dto.diasSemana());

        if (dto.idProfessor() != null) {
            Professor professor = professorRepository.findById(dto.idProfessor());
            if (professor == null) {
                throw new ValidationException("idProfessor", "Professor não encontrado");
            }
            turma.setProfessor(professor);
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
    public List<TurmaResponseDTO> findByNivel(Integer idNivel) {
        return turmaRepository.findByNivel(Nivel.valueOf(idNivel))
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
