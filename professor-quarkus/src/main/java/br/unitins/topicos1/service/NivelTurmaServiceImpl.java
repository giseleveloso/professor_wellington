package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.NivelTurmaDTO;
import br.unitins.topicos1.dto.NivelTurmaResponseDTO;
import br.unitins.topicos1.model.NivelTurma;
import br.unitins.topicos1.repository.NivelTurmaRepository;
import br.unitins.topicos1.repository.ProfessorRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class NivelTurmaServiceImpl implements NivelTurmaService {

    @Inject
    NivelTurmaRepository nivelTurmaRepository;

    @Inject
    ProfessorRepository professorRepository;

    private static final String[][] NIVEIS_PADRAO = {
        {"A0", "Pré-iniciante"},
        {"A1", "Iniciante"},
        {"A2", "Básico"},
        {"B1", "Intermediário"},
        {"B2", "Intermediário Superior"},
        {"C1", "Avançado"},
        {"C2", "Proficiente"}
    };

    @Override
    @Transactional
    public NivelTurmaResponseDTO create(NivelTurmaDTO dto, Long professorId) {
        var professor = professorRepository.findById(professorId);
        if (professor == null) {
            throw new ValidationException("professor", "Professor não encontrado");
        }

        var existente = nivelTurmaRepository.findByCodigoAndProfessorId(dto.codigo(), professorId);
        if (existente != null) {
            throw new ValidationException("codigo", "Já existe um nível com este código");
        }

        NivelTurma nivel = new NivelTurma();
        nivel.setCodigo(dto.codigo());
        nivel.setDescricao(dto.descricao());
        nivel.setOrdem(dto.ordem() != null ? dto.ordem() : (int) (nivelTurmaRepository.countByProfessorId(professorId) + 1));
        nivel.setProfessor(professor);

        nivelTurmaRepository.persist(nivel);
        return NivelTurmaResponseDTO.valueOf(nivel);
    }

    @Override
    @Transactional
    public NivelTurmaResponseDTO update(Long id, NivelTurmaDTO dto) {
        NivelTurma nivel = nivelTurmaRepository.findById(id);
        if (nivel == null) {
            throw new ValidationException("id", "Nível não encontrado");
        }

        nivel.setCodigo(dto.codigo());
        nivel.setDescricao(dto.descricao());
        if (dto.ordem() != null) {
            nivel.setOrdem(dto.ordem());
        }

        return NivelTurmaResponseDTO.valueOf(nivel);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        NivelTurma nivel = nivelTurmaRepository.findById(id);
        if (nivel != null) {
            nivelTurmaRepository.delete(nivel);
        }
    }

    @Override
    public NivelTurmaResponseDTO findById(Long id) {
        NivelTurma nivel = nivelTurmaRepository.findById(id);
        if (nivel == null) {
            throw new ValidationException("id", "Nível não encontrado");
        }
        return NivelTurmaResponseDTO.valueOf(nivel);
    }

    @Override
    public List<NivelTurmaResponseDTO> findByProfessorId(Long professorId) {
        return nivelTurmaRepository.findByProfessorId(professorId)
            .stream()
            .map(NivelTurmaResponseDTO::valueOf)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void criarNiveisPadrao(Long professorId) {
        var professor = professorRepository.findById(professorId);
        if (professor == null) {
            throw new ValidationException("professor", "Professor não encontrado");
        }

        // Remove níveis existentes
        var existentes = nivelTurmaRepository.findByProfessorId(professorId);
        for (NivelTurma nivel : existentes) {
            nivelTurmaRepository.delete(nivel);
        }

        // Cria níveis padrão
        for (int i = 0; i < NIVEIS_PADRAO.length; i++) {
            NivelTurma nivel = new NivelTurma();
            nivel.setCodigo(NIVEIS_PADRAO[i][0]);
            nivel.setDescricao(NIVEIS_PADRAO[i][1]);
            nivel.setOrdem(i + 1);
            nivel.setProfessor(professor);
            nivelTurmaRepository.persist(nivel);
        }
    }

    @Override
    @Transactional
    public void reordenar(Long professorId, List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            NivelTurma nivel = nivelTurmaRepository.findById(ids.get(i));
            if (nivel != null && nivel.getProfessor().getId().equals(professorId)) {
                nivel.setOrdem(i + 1);
            }
        }
    }
}
