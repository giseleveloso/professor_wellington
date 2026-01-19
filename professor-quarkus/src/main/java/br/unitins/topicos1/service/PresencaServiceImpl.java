package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.PresencaDTO;
import br.unitins.topicos1.dto.PresencaResponseDTO;
import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Presenca;
import br.unitins.topicos1.model.StatusDeverCasa;
import br.unitins.topicos1.model.StatusPreparacaoAula;
import br.unitins.topicos1.model.StatusPresenca;
import br.unitins.topicos1.repository.AlunoRepository;
import br.unitins.topicos1.repository.AulaRepository;
import br.unitins.topicos1.repository.PresencaRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PresencaServiceImpl implements PresencaService {

    @Inject
    PresencaRepository presencaRepository;

    @Inject
    AulaRepository aulaRepository;

    @Inject
    AlunoRepository alunoRepository;

    @Override
    @Transactional
    public PresencaResponseDTO create(PresencaDTO dto) {
        Aula aula = aulaRepository.findById(dto.idAula());
        if (aula == null) {
            throw new ValidationException("idAula", "Aula não encontrada");
        }

        Aluno aluno = alunoRepository.findById(dto.idAluno());
        if (aluno == null) {
            throw new ValidationException("idAluno", "Aluno não encontrado");
        }

        // Verificar se já existe presença para essa aula e aluno
        Presenca existente = presencaRepository.findByAulaIdAndAlunoId(dto.idAula(), dto.idAluno());
        if (existente != null) {
            throw new ValidationException("presenca", "Já existe registro de presença para este aluno nesta aula");
        }

        Presenca presenca = new Presenca();
        preencherPresenca(presenca, dto);
        presenca.setAula(aula);
        presenca.setAluno(aluno);

        presencaRepository.persist(presenca);
        return PresencaResponseDTO.valueOf(presenca);
    }

    @Override
    @Transactional
    public PresencaResponseDTO update(Long id, PresencaDTO dto) {
        Presenca presenca = presencaRepository.findById(id);
        if (presenca == null) {
            throw new ValidationException("id", "Presença não encontrada");
        }

        preencherPresenca(presenca, dto);

        return PresencaResponseDTO.valueOf(presenca);
    }

    private void preencherPresenca(Presenca presenca, PresencaDTO dto) {
        // Status de presença
        if (dto.status() != null) {
            presenca.setStatus(StatusPresenca.fromLabel(dto.status()));
            presenca.setPresente(dto.status().equals("presente"));
        } else if (dto.presente() != null) {
            presenca.setPresente(dto.presente());
            presenca.setStatus(dto.presente() ? StatusPresenca.PRESENTE : StatusPresenca.FALTA);
        }

        // Dever de casa
        if (dto.deverCasa() != null) {
            presenca.setDeverCasa(StatusDeverCasa.fromLabel(dto.deverCasa()));
        }

        // Preparação para aula
        if (dto.preparacaoAula() != null) {
            presenca.setPreparacaoAula(StatusPreparacaoAula.fromLabel(dto.preparacaoAula()));
        }

        // Comentário e observação
        presenca.setComentario(dto.comentario());
        presenca.setObservacao(dto.observacao());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Presenca presenca = presencaRepository.findById(id);
        if (presenca == null) {
            throw new ValidationException("id", "Presença não encontrada");
        }
        presencaRepository.delete(presenca);
    }

    @Override
    public PresencaResponseDTO findById(Long id) {
        Presenca presenca = presencaRepository.findById(id);
        if (presenca == null) {
            throw new ValidationException("id", "Presença não encontrada");
        }
        return PresencaResponseDTO.valueOf(presenca);
    }

    @Override
    public List<PresencaResponseDTO> findByAulaId(Long aulaId) {
        return presencaRepository.findByAulaId(aulaId)
                .stream()
                .map(PresencaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PresencaResponseDTO> findByAlunoId(Long alunoId) {
        return presencaRepository.findByAlunoId(alunoId)
                .stream()
                .map(PresencaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public PresencaResponseDTO findByAulaIdAndAlunoId(Long aulaId, Long alunoId) {
        Presenca presenca = presencaRepository.findByAulaIdAndAlunoId(aulaId, alunoId);
        if (presenca == null) {
            return null;
        }
        return PresencaResponseDTO.valueOf(presenca);
    }

    @Override
    @Transactional
    public void registrarPresencaEmLote(Long aulaId, List<PresencaDTO> presencas) {
        Aula aula = aulaRepository.findById(aulaId);
        if (aula == null) {
            throw new ValidationException("idAula", "Aula não encontrada");
        }

        for (PresencaDTO dto : presencas) {
            Aluno aluno = alunoRepository.findById(dto.idAluno());
            if (aluno == null) {
                continue;
            }

            Presenca existente = presencaRepository.findByAulaIdAndAlunoId(aulaId, dto.idAluno());
            if (existente != null) {
                preencherPresenca(existente, dto);
            } else {
                Presenca presenca = new Presenca();
                preencherPresenca(presenca, dto);
                presenca.setAula(aula);
                presenca.setAluno(aluno);
                presencaRepository.persist(presenca);
            }
        }
    }

    @Override
    public long countPresencasByAlunoId(Long alunoId) {
        return presencaRepository.countPresencasByAlunoId(alunoId);
    }

    @Override
    public long countFaltasByAlunoId(Long alunoId) {
        return presencaRepository.countFaltasByAlunoId(alunoId);
    }
}
