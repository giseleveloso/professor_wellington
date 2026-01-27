package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.MaterialExtraAulaDTO;
import br.unitins.topicos1.dto.MaterialExtraAulaResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.MaterialExtraAula;
import br.unitins.topicos1.model.SubcategoriaVideo;
import br.unitins.topicos1.model.TipoConteudo;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.repository.CategoriaVideoRepository;
import br.unitins.topicos1.repository.MaterialExtraAulaRepository;
import br.unitins.topicos1.repository.SubcategoriaVideoRepository;
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

    @Inject
    CategoriaVideoRepository categoriaRepository;

    @Inject
    SubcategoriaVideoRepository subcategoriaRepository;

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

        setCategoriaSubcategoria(material, dto);

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

        setCategoriaSubcategoria(material, dto);

        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    private void setCategoriaSubcategoria(MaterialExtraAula material, MaterialExtraAulaDTO dto) {
        if (dto.idSubcategoria() != null) {
            SubcategoriaVideo subcategoria = subcategoriaRepository.findById(dto.idSubcategoria());
            if (subcategoria == null) {
                throw new ValidationException("idSubcategoria", "Subcategoria não encontrada");
            }
            material.setSubcategoria(subcategoria);
            material.setCategoria(subcategoria.getCategoriaRaiz());
        } else if (dto.idCategoria() != null) {
            CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoria());
            if (categoria == null) {
                throw new ValidationException("idCategoria", "Categoria não encontrada");
            }
            material.setCategoria(categoria);
            material.setSubcategoria(null);
        } else {
            material.setCategoria(null);
            material.setSubcategoria(null);
        }
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

    @Override
    public List<MaterialExtraAulaResponseDTO> findByCategoria(Long idCategoria) {
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return materialRepository.findByCategoria(categoria)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findBySubcategoria(Long idSubcategoria) {
        return materialRepository.findBySubcategoria(idSubcategoria)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Long idCategoria) {
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return materialRepository.findByTurmaIdAndCategoria(turmaId, categoria)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria) {
        return materialRepository.findByTurmaIdAndSubcategoria(turmaId, idSubcategoria)
                .stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
