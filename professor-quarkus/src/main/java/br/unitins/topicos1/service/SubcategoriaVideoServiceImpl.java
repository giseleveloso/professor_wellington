package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.SubcategoriaVideoDTO;
import br.unitins.topicos1.dto.SubcategoriaVideoResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.SubcategoriaVideo;
import br.unitins.topicos1.repository.CategoriaVideoRepository;
import br.unitins.topicos1.repository.SubcategoriaVideoRepository;
import br.unitins.topicos1.util.TenantContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class SubcategoriaVideoServiceImpl implements SubcategoriaVideoService {

    @Inject
    SubcategoriaVideoRepository subcategoriaRepository;

    @Inject
    CategoriaVideoRepository categoriaRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public SubcategoriaVideoResponseDTO create(SubcategoriaVideoDTO dto) {
        CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoriaRaiz());
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }

        SubcategoriaVideo subcategoria = new SubcategoriaVideo();
        subcategoria.setNome(dto.nome());
        subcategoria.setDescricao(dto.descricao());
        subcategoria.setCategoriaRaiz(categoria);

        // Definir a subcategoria pai, se fornecida
        if (dto.idSubcategoriaPai() != null) {
            SubcategoriaVideo pai = subcategoriaRepository.findById(dto.idSubcategoriaPai());
            if (pai == null) {
                throw new NotFoundException("Subcategoria pai não encontrada");
            }
            subcategoria.setSubcategoriaPai(pai);
            subcategoria.setNivel(pai.getNivel() + 1);
        } else {
            subcategoria.setNivel(0);
        }

        // Associar ao tenant
        subcategoria.setProfessor(tenantContext.getCurrentProfessor());
        if (tenantContext.isSharedMode()) {
            subcategoria.setEscola(tenantContext.getCurrentEscola());
        }

        subcategoriaRepository.persist(subcategoria);
        return SubcategoriaVideoResponseDTO.valueOf(subcategoria);
    }

    @Override
    @Transactional
    public SubcategoriaVideoResponseDTO update(Long id, SubcategoriaVideoDTO dto) {
        SubcategoriaVideo subcategoria = subcategoriaRepository.findById(id);
        if (subcategoria == null) {
            throw new NotFoundException("Subcategoria não encontrada");
        }

        CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoriaRaiz());
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }

        subcategoria.setNome(dto.nome());
        subcategoria.setDescricao(dto.descricao());
        subcategoria.setCategoriaRaiz(categoria);

        // Atualizar subcategoria pai
        if (dto.idSubcategoriaPai() != null) {
            if (dto.idSubcategoriaPai().equals(id)) {
                throw new IllegalArgumentException("Subcategoria não pode ser pai de si mesma");
            }

            SubcategoriaVideo pai = subcategoriaRepository.findById(dto.idSubcategoriaPai());
            if (pai == null) {
                throw new NotFoundException("Subcategoria pai não encontrada");
            }

            // Verificar se não cria um ciclo
            if (isCiclo(id, dto.idSubcategoriaPai())) {
                throw new IllegalArgumentException("Não é possível criar uma hierarquia circular");
            }

            subcategoria.setSubcategoriaPai(pai);
            subcategoria.setNivel(pai.getNivel() + 1);
        } else {
            subcategoria.setSubcategoriaPai(null);
            subcategoria.setNivel(0);
        }

        return SubcategoriaVideoResponseDTO.valueOf(subcategoria);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SubcategoriaVideo subcategoria = subcategoriaRepository.findById(id);
        if (subcategoria == null) {
            throw new NotFoundException("Subcategoria não encontrada");
        }

        // Verificar se tem filhos
        List<SubcategoriaVideo> filhos = subcategoriaRepository.findBySubcategoriaPai(id);
        if (!filhos.isEmpty()) {
            throw new IllegalStateException("Não é possível excluir uma subcategoria que possui subcategorias filhas");
        }

        subcategoriaRepository.delete(subcategoria);
    }

    @Override
    public SubcategoriaVideoResponseDTO findById(Long id) {
        SubcategoriaVideo subcategoria = subcategoriaRepository.findById(id);
        if (subcategoria == null) {
            throw new NotFoundException("Subcategoria não encontrada");
        }
        return SubcategoriaVideoResponseDTO.valueOf(subcategoria);
    }

    @Override
    public List<SubcategoriaVideoResponseDTO> findAll() {
        List<SubcategoriaVideo> subcategorias;
        if (tenantContext.isSharedMode()) {
            subcategorias = subcategoriaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            subcategorias = subcategoriaRepository.findByProfessorId(tenantContext.getCurrentProfessor().getId());
        }
        return subcategorias.stream()
                .map(SubcategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<SubcategoriaVideoResponseDTO> findByCategoriaRaiz(Long idCategoriaRaiz) {
        CategoriaVideo categoria = categoriaRepository.findById(idCategoriaRaiz);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }
        return subcategoriaRepository.findByCategoriaRaiz(categoria).stream()
                .map(SubcategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<SubcategoriaVideoResponseDTO> findBySubcategoriaPai(Long idSubcategoriaPai) {
        return subcategoriaRepository.findBySubcategoriaPai(idSubcategoriaPai).stream()
                .map(SubcategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<SubcategoriaVideoResponseDTO> findRaizes(Long idCategoriaRaiz) {
        CategoriaVideo categoria = categoriaRepository.findById(idCategoriaRaiz);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }
        return subcategoriaRepository.findRaizes(categoria).stream()
                .map(SubcategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<SubcategoriaVideoResponseDTO> findByNome(String nome) {
        return subcategoriaRepository.findByNomeContaining(nome).stream()
                .map(SubcategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    // Método auxiliar para verificar se a atualização criaria um ciclo
    private boolean isCiclo(Long subcategoriaId, Long novoPaiId) {
        SubcategoriaVideo atual = subcategoriaRepository.findById(novoPaiId);
        while (atual != null) {
            if (atual.getId().equals(subcategoriaId)) {
                return true;
            }
            atual = atual.getSubcategoriaPai();
        }
        return false;
    }
}
