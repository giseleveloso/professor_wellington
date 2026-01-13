package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.DesempenhoDTO;
import br.unitins.topicos1.dto.DesempenhoResponseDTO;
import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Desempenho;
import br.unitins.topicos1.repository.AlunoRepository;
import br.unitins.topicos1.repository.AulaRepository;
import br.unitins.topicos1.repository.DesempenhoRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DesempenhoServiceImpl implements DesempenhoService {

    @Inject
    DesempenhoRepository desempenhoRepository;

    @Inject
    AulaRepository aulaRepository;

    @Inject
    AlunoRepository alunoRepository;

    @Override
    @Transactional
    public DesempenhoResponseDTO create(DesempenhoDTO dto) {
        Aula aula = aulaRepository.findById(dto.idAula());
        if (aula == null) {
            throw new ValidationException("idAula", "Aula não encontrada");
        }

        Aluno aluno = alunoRepository.findById(dto.idAluno());
        if (aluno == null) {
            throw new ValidationException("idAluno", "Aluno não encontrado");
        }

        Desempenho desempenho = new Desempenho();
        desempenho.setNota(dto.nota());
        desempenho.setComentario(dto.comentario());
        desempenho.setPrivado(dto.privado() != null ? dto.privado() : false);
        desempenho.setAula(aula);
        desempenho.setAluno(aluno);

        desempenhoRepository.persist(desempenho);
        return DesempenhoResponseDTO.valueOf(desempenho);
    }

    @Override
    @Transactional
    public DesempenhoResponseDTO update(Long id, DesempenhoDTO dto) {
        Desempenho desempenho = desempenhoRepository.findById(id);
        if (desempenho == null) {
            throw new ValidationException("id", "Desempenho não encontrado");
        }

        desempenho.setNota(dto.nota());
        desempenho.setComentario(dto.comentario());
        desempenho.setPrivado(dto.privado() != null ? dto.privado() : false);

        return DesempenhoResponseDTO.valueOf(desempenho);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Desempenho desempenho = desempenhoRepository.findById(id);
        if (desempenho == null) {
            throw new ValidationException("id", "Desempenho não encontrado");
        }
        desempenhoRepository.delete(desempenho);
    }

    @Override
    public DesempenhoResponseDTO findById(Long id) {
        Desempenho desempenho = desempenhoRepository.findById(id);
        if (desempenho == null) {
            throw new ValidationException("id", "Desempenho não encontrado");
        }
        return DesempenhoResponseDTO.valueOf(desempenho);
    }

    @Override
    public List<DesempenhoResponseDTO> findByAulaId(Long aulaId) {
        return desempenhoRepository.findByAulaId(aulaId)
                .stream()
                .map(DesempenhoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<DesempenhoResponseDTO> findByAlunoId(Long alunoId) {
        return desempenhoRepository.findByAlunoId(alunoId)
                .stream()
                .map(DesempenhoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<DesempenhoResponseDTO> findByAlunoIdParaAluno(Long alunoId) {
        return desempenhoRepository.findByAlunoId(alunoId)
                .stream()
                .map(DesempenhoResponseDTO::valueOfParaAluno)
                .collect(Collectors.toList());
    }

    @Override
    public DesempenhoResponseDTO findByAulaIdAndAlunoId(Long aulaId, Long alunoId) {
        Desempenho desempenho = desempenhoRepository.findByAulaIdAndAlunoId(aulaId, alunoId);
        if (desempenho == null) {
            return null;
        }
        return DesempenhoResponseDTO.valueOf(desempenho);
    }
}
