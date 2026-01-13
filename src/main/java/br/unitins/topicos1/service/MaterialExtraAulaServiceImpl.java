package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.MaterialExtraAulaDTO;
import br.unitins.topicos1.dto.MaterialExtraAulaResponseDTO;
import br.unitins.topicos1.model.MaterialExtraAula;
import br.unitins.topicos1.model.TipoConteudo;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.repository.MaterialExtraAulaRepository;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MaterialExtraAulaServiceImpl implements MaterialExtraAulaService {

    @Inject
    MaterialExtraAulaRepository materialRepository;

    @Inject
    TurmaRepository turmaRepository;

    @Override
    @Transactional
    public MaterialExtraAulaResponseDTO create(MaterialExtraAulaDTO dto) {
        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        MaterialExtraAula material = new MaterialExtraAula();
        material.setTitulo(dto.titulo());
        material.setTipoConteudo(TipoConteudo.valueOf(dto.idTipoConteudo()));
        material.setDescricao(dto.descricao());
        material.setUrlArquivo(dto.urlArquivo());
        material.setDataPublicacao(dto.dataPublicacao() != null ? dto.dataPublicacao() : LocalDate.now());
        material.setTurma(turma);

        materialRepository.persist(material);
        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    @Override
    @Transactional
    public MaterialExtraAulaResponseDTO update(Long id, MaterialExtraAulaDTO dto) {
        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }

        material.setTitulo(dto.titulo());
        material.setTipoConteudo(TipoConteudo.valueOf(dto.idTipoConteudo()));
        material.setDescricao(dto.descricao());
        material.setUrlArquivo(dto.urlArquivo());

        if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            material.setTurma(turma);
        }

        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }
        materialRepository.delete(material);
    }

    @Override
    public MaterialExtraAulaResponseDTO findById(Long id) {
        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }
        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findAll() {
        return materialRepository.listAll()
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaId(Long turmaId) {
        return materialRepository.findByTurmaId(turmaId)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTipoConteudo(Integer idTipoConteudo) {
        return materialRepository.findByTipoConteudo(TipoConteudo.valueOf(idTipoConteudo))
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndTipoConteudo(Long turmaId, Integer idTipoConteudo) {
        return materialRepository.findByTurmaIdAndTipoConteudo(turmaId, TipoConteudo.valueOf(idTipoConteudo))
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTitulo(String titulo) {
        return materialRepository.findByTitulo(titulo)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
