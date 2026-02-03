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
import br.unitins.topicos1.util.TenantContext;
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

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public MaterialExtraAulaResponseDTO create(MaterialExtraAulaDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        // Verificar se a turma pertence ao professor logado
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
        }

        MaterialExtraAula material = new MaterialExtraAula();
        material.setTitulo(dto.titulo());
        material.setTipoConteudo(TipoConteudo.valueOf(dto.idTipoConteudo()));
        material.setDescricao(dto.descricao());
        material.setUrlArquivo(dto.urlArquivo());
        material.setDataPublicacao(dto.dataPublicacao() != null ? dto.dataPublicacao() : LocalDate.now());
        material.setTurma(turma);

        setCategoriaSubcategoria(material, dto, professorLogado.getId());

        materialRepository.persist(material);
        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    @Override
    @Transactional
    public MaterialExtraAulaResponseDTO update(Long id, MaterialExtraAulaDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }

        // Verificar se o material pertence ao professor logado (via turma)
        if (!material.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar este material");
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
            // Verificar se a nova turma pertence ao professor logado
            if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
            }
            material.setTurma(turma);
        }

        setCategoriaSubcategoria(material, dto, professorLogado.getId());

        return MaterialExtraAulaResponseDTO.valueOf(material);
    }

    private void setCategoriaSubcategoria(MaterialExtraAula material, MaterialExtraAulaDTO dto, Long professorId) {
        if (dto.idSubcategoria() != null) {
            SubcategoriaVideo subcategoria = subcategoriaRepository.findById(dto.idSubcategoria());
            if (subcategoria == null) {
                throw new ValidationException("idSubcategoria", "Subcategoria não encontrada");
            }
            // Verificar se a subcategoria pertence ao professor logado
            if (!subcategoria.getProfessor().getId().equals(professorId)) {
                throw new ValidationException("idSubcategoria", "Subcategoria não pertence ao professor logado");
            }
            material.setSubcategoria(subcategoria);
            material.setCategoria(subcategoria.getCategoriaRaiz());
        } else if (dto.idCategoria() != null) {
            CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoria());
            if (categoria == null) {
                throw new ValidationException("idCategoria", "Categoria não encontrada");
            }
            // Verificar se a categoria pertence ao professor logado
            if (!categoria.getProfessor().getId().equals(professorId)) {
                throw new ValidationException("idCategoria", "Categoria não pertence ao professor logado");
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
        var professorLogado = tenantContext.getProfessorDoContexto();

        MaterialExtraAula material = materialRepository.findById(id);
        if (material == null) {
            throw new ValidationException("id", "Material não encontrado");
        }

        // Verificar se o material pertence ao professor logado (via turma)
        if (!material.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir este material");
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
        List<MaterialExtraAula> materiais;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            materiais = materialRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            materiais = materialRepository.findByProfessorId(professor.getId());
        }
        return materiais.stream()
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaId(Long turmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findByTurmaId(turmaId)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTipoConteudo(Integer idTipoConteudo) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findByTipoConteudo(TipoConteudo.valueOf(idTipoConteudo))
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndTipoConteudo(Long turmaId, Integer idTipoConteudo) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findByTurmaIdAndTipoConteudo(turmaId, TipoConteudo.valueOf(idTipoConteudo))
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTitulo(String titulo) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findByTitulo(titulo)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByCategoria(Long idCategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return materialRepository.findByCategoria(categoria)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findBySubcategoria(Long idSubcategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findBySubcategoria(idSubcategoria)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Long idCategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return materialRepository.findByTurmaIdAndCategoria(turmaId, categoria)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialExtraAulaResponseDTO> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return materialRepository.findByTurmaIdAndSubcategoria(turmaId, idSubcategoria)
                .stream()
                .filter(m -> m.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(MaterialExtraAulaResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
