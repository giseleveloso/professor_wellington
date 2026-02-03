package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.CategoriaVideoDTO;
import br.unitins.topicos1.dto.CategoriaVideoResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.repository.CategoriaVideoRepository;
import br.unitins.topicos1.util.TenantContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class CategoriaVideoServiceImpl implements CategoriaVideoService {

    @Inject
    CategoriaVideoRepository categoriaRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public CategoriaVideoResponseDTO create(CategoriaVideoDTO dto) {
        // Verificar se já existe uma categoria com o mesmo nome para este tenant
        CategoriaVideo existente;
        if (tenantContext.isSharedMode()) {
            existente = categoriaRepository.findByNomeAndEscolaId(dto.nome(), tenantContext.getCurrentEscola().getId());
        } else {
            existente = categoriaRepository.findByNomeAndProfessorId(dto.nome(), tenantContext.getCurrentProfessor().getId());
        }
        if (existente != null) {
            throw new IllegalArgumentException("Já existe uma categoria com este nome");
        }

        CategoriaVideo categoria = new CategoriaVideo();
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setCor(dto.cor());
        categoria.setProfessor(tenantContext.getCurrentProfessor());
        if (tenantContext.isSharedMode()) {
            categoria.setEscola(tenantContext.getCurrentEscola());
        }

        categoriaRepository.persist(categoria);
        return CategoriaVideoResponseDTO.valueOf(categoria);
    }

    @Override
    @Transactional
    public CategoriaVideoResponseDTO update(Long id, CategoriaVideoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        CategoriaVideo categoria = categoriaRepository.findById(id);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }

        // Verificar se a categoria pertence ao professor logado
        if (!categoria.getProfessor().getId().equals(professorLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para editar esta categoria");
        }

        // Verificar se o novo nome já existe em outra categoria para este tenant
        CategoriaVideo existente;
        if (tenantContext.isSharedMode()) {
            existente = categoriaRepository.findByNomeAndEscolaId(dto.nome(), tenantContext.getCurrentEscola().getId());
        } else {
            existente = categoriaRepository.findByNomeAndProfessorId(dto.nome(), professorLogado.getId());
        }
        if (existente != null && !existente.getId().equals(id)) {
            throw new IllegalArgumentException("Já existe outra categoria com este nome");
        }

        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setCor(dto.cor());

        return CategoriaVideoResponseDTO.valueOf(categoria);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        CategoriaVideo categoria = categoriaRepository.findById(id);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }

        // Verificar se a categoria pertence ao professor logado
        if (!categoria.getProfessor().getId().equals(professorLogado.getId())) {
            throw new IllegalArgumentException("Você não tem permissão para excluir esta categoria");
        }

        categoriaRepository.delete(categoria);
    }

    @Override
    public CategoriaVideoResponseDTO findById(Long id) {
        CategoriaVideo categoria = categoriaRepository.findById(id);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }
        return CategoriaVideoResponseDTO.valueOf(categoria);
    }

    @Override
    public List<CategoriaVideoResponseDTO> findAll() {
        List<CategoriaVideo> categorias;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            categorias = categoriaRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            categorias = categoriaRepository.findByProfessorId(professor.getId());
        }
        return categorias.stream()
                .map(CategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<CategoriaVideoResponseDTO> findByNome(String nome) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return categoriaRepository.findByNomeContaining(nome).stream()
                .filter(c -> c.getProfessor().getId().equals(professorLogado.getId()))
                .map(CategoriaVideoResponseDTO::valueOf)
                .toList();
    }
}
