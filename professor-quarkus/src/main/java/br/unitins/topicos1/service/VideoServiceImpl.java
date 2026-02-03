package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.VideoDTO;
import br.unitins.topicos1.dto.VideoResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.SubcategoriaVideo;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.model.Video;
import br.unitins.topicos1.repository.CategoriaVideoRepository;
import br.unitins.topicos1.repository.SubcategoriaVideoRepository;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.repository.VideoRepository;
import br.unitins.topicos1.util.TenantContext;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class VideoServiceImpl implements VideoService {

    @Inject
    VideoRepository videoRepository;

    @Inject
    TurmaRepository turmaRepository;

    @Inject
    SubcategoriaVideoRepository subcategoriaRepository;

    @Inject
    CategoriaVideoRepository categoriaRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public VideoResponseDTO create(VideoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        // Validar que pelo menos categoria ou subcategoria foi fornecida
        if (dto.idCategoria() == null && dto.idSubcategoria() == null) {
            throw new ValidationException("categoria", "É necessário informar uma categoria ou subcategoria");
        }

        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        // Verificar se a turma pertence ao professor logado
        if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
        }

        Video video = new Video();
        video.setTitulo(dto.titulo());
        video.setLinkYoutube(dto.linkYoutube());
        video.setDescricao(dto.descricao());

        // Definir categoria (se não houver subcategoria)
        if (dto.idCategoria() != null) {
            CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoria());
            if (categoria == null) {
                throw new ValidationException("idCategoria", "Categoria não encontrada");
            }
            // Verificar se a categoria pertence ao professor logado
            if (!categoria.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idCategoria", "Categoria não pertence ao professor logado");
            }
            video.setCategoria(categoria);
        }

        // Definir subcategoria (se fornecida)
        if (dto.idSubcategoria() != null) {
            SubcategoriaVideo subcategoria = subcategoriaRepository.findById(dto.idSubcategoria());
            if (subcategoria == null) {
                throw new ValidationException("idSubcategoria", "Subcategoria não encontrada");
            }
            // Verificar se a subcategoria pertence ao professor logado
            if (!subcategoria.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idSubcategoria", "Subcategoria não pertence ao professor logado");
            }
            video.setSubcategoria(subcategoria);
            // Se tem subcategoria, usar a categoria raiz dela
            video.setCategoria(subcategoria.getCategoriaRaiz());
        }

        video.setTurma(turma);

        videoRepository.persist(video);
        return VideoResponseDTO.valueOf(video);
    }

    @Override
    @Transactional
    public VideoResponseDTO update(Long id, VideoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        // Validar que pelo menos categoria ou subcategoria foi fornecida
        if (dto.idCategoria() == null && dto.idSubcategoria() == null) {
            throw new ValidationException("categoria", "É necessário informar uma categoria ou subcategoria");
        }

        Video video = videoRepository.findById(id);
        if (video == null) {
            throw new ValidationException("id", "Vídeo não encontrado");
        }

        // Verificar se o vídeo pertence ao professor logado (via turma)
        if (!video.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar este vídeo");
        }

        video.setTitulo(dto.titulo());
        video.setLinkYoutube(dto.linkYoutube());
        video.setDescricao(dto.descricao());

        // Definir categoria (se não houver subcategoria)
        if (dto.idCategoria() != null) {
            CategoriaVideo categoria = categoriaRepository.findById(dto.idCategoria());
            if (categoria == null) {
                throw new ValidationException("idCategoria", "Categoria não encontrada");
            }
            // Verificar se a categoria pertence ao professor logado
            if (!categoria.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idCategoria", "Categoria não pertence ao professor logado");
            }
            video.setCategoria(categoria);
        }

        // Definir subcategoria (se fornecida)
        if (dto.idSubcategoria() != null) {
            SubcategoriaVideo subcategoria = subcategoriaRepository.findById(dto.idSubcategoria());
            if (subcategoria == null) {
                throw new ValidationException("idSubcategoria", "Subcategoria não encontrada");
            }
            // Verificar se a subcategoria pertence ao professor logado
            if (!subcategoria.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idSubcategoria", "Subcategoria não pertence ao professor logado");
            }
            video.setSubcategoria(subcategoria);
            // Se tem subcategoria, usar a categoria raiz dela
            video.setCategoria(subcategoria.getCategoriaRaiz());
        } else {
            // Se não tem subcategoria no DTO, limpar a subcategoria do vídeo
            video.setSubcategoria(null);
        }

        if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            // Verificar se a nova turma pertence ao professor logado
            if (!turma.getProfessor().getId().equals(professorLogado.getId())) {
                throw new ValidationException("idTurma", "Turma não pertence ao professor logado");
            }
            video.setTurma(turma);
        }

        return VideoResponseDTO.valueOf(video);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Video video = videoRepository.findById(id);
        if (video == null) {
            throw new ValidationException("id", "Vídeo não encontrado");
        }

        // Verificar se o vídeo pertence ao professor logado (via turma)
        if (!video.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir este vídeo");
        }

        videoRepository.delete(video);
    }

    @Override
    public VideoResponseDTO findById(Long id) {
        Video video = videoRepository.findById(id);
        if (video == null) {
            throw new ValidationException("id", "Vídeo não encontrado");
        }
        return VideoResponseDTO.valueOf(video);
    }

    @Override
    public List<VideoResponseDTO> findAll() {
        List<Video> videos;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            videos = videoRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            videos = videoRepository.findByProfessorId(professor.getId());
        }
        return videos.stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTurmaId(Long turmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return videoRepository.findByTurmaId(turmaId)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByCategoria(Long idCategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return videoRepository.findByCategoria(categoria)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Long idCategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        CategoriaVideo categoria = categoriaRepository.findById(idCategoria);
        if (categoria == null) {
            throw new ValidationException("idCategoria", "Categoria não encontrada");
        }
        return videoRepository.findByTurmaIdAndCategoria(turmaId, categoria)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTitulo(String titulo) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return videoRepository.findByTitulo(titulo)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findBySubcategoria(Long idSubcategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return videoRepository.findBySubcategoria(idSubcategoria)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return videoRepository.findByTurmaIdAndSubcategoria(turmaId, idSubcategoria)
                .stream()
                .filter(v -> v.getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
