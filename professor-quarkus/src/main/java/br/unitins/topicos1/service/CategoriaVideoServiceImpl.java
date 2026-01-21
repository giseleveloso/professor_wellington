package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.CategoriaVideoDTO;
import br.unitins.topicos1.dto.CategoriaVideoResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.repository.CategoriaVideoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class CategoriaVideoServiceImpl implements CategoriaVideoService {

    @Inject
    CategoriaVideoRepository categoriaRepository;

    @Override
    @Transactional
    public CategoriaVideoResponseDTO create(CategoriaVideoDTO dto) {
        // Verificar se já existe uma categoria com o mesmo nome
        CategoriaVideo existente = categoriaRepository.findByNome(dto.nome());
        if (existente != null) {
            throw new IllegalArgumentException("Já existe uma categoria com este nome");
        }

        CategoriaVideo categoria = new CategoriaVideo();
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        categoria.setCor(dto.cor());

        categoriaRepository.persist(categoria);
        return CategoriaVideoResponseDTO.valueOf(categoria);
    }

    @Override
    @Transactional
    public CategoriaVideoResponseDTO update(Long id, CategoriaVideoDTO dto) {
        CategoriaVideo categoria = categoriaRepository.findById(id);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
        }

        // Verificar se o novo nome já existe em outra categoria
        CategoriaVideo existente = categoriaRepository.findByNome(dto.nome());
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
        CategoriaVideo categoria = categoriaRepository.findById(id);
        if (categoria == null) {
            throw new NotFoundException("Categoria não encontrada");
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
        return categoriaRepository.findAll().stream()
                .map(CategoriaVideoResponseDTO::valueOf)
                .toList();
    }

    @Override
    public List<CategoriaVideoResponseDTO> findByNome(String nome) {
        return categoriaRepository.findByNomeContaining(nome).stream()
                .map(CategoriaVideoResponseDTO::valueOf)
                .toList();
    }
}
