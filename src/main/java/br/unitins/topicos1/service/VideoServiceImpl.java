package br.unitins.topicos1.service;

import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.VideoDTO;
import br.unitins.topicos1.dto.VideoResponseDTO;
import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.Turma;
import br.unitins.topicos1.model.Video;
import br.unitins.topicos1.repository.TurmaRepository;
import br.unitins.topicos1.repository.VideoRepository;
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

    @Override
    @Transactional
    public VideoResponseDTO create(VideoDTO dto) {
        Turma turma = turmaRepository.findById(dto.idTurma());
        if (turma == null) {
            throw new ValidationException("idTurma", "Turma não encontrada");
        }

        Video video = new Video();
        video.setTitulo(dto.titulo());
        video.setLinkYoutube(dto.linkYoutube());
        video.setDescricao(dto.descricao());
        video.setCategoria(CategoriaVideo.valueOf(dto.idCategoria()));
        video.setTurma(turma);

        videoRepository.persist(video);
        return VideoResponseDTO.valueOf(video);
    }

    @Override
    @Transactional
    public VideoResponseDTO update(Long id, VideoDTO dto) {
        Video video = videoRepository.findById(id);
        if (video == null) {
            throw new ValidationException("id", "Vídeo não encontrado");
        }

        video.setTitulo(dto.titulo());
        video.setLinkYoutube(dto.linkYoutube());
        video.setDescricao(dto.descricao());
        video.setCategoria(CategoriaVideo.valueOf(dto.idCategoria()));

        if (dto.idTurma() != null) {
            Turma turma = turmaRepository.findById(dto.idTurma());
            if (turma == null) {
                throw new ValidationException("idTurma", "Turma não encontrada");
            }
            video.setTurma(turma);
        }

        return VideoResponseDTO.valueOf(video);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Video video = videoRepository.findById(id);
        if (video == null) {
            throw new ValidationException("id", "Vídeo não encontrado");
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
        return videoRepository.listAll()
                .stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTurmaId(Long turmaId) {
        return videoRepository.findByTurmaId(turmaId)
                .stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByCategoria(Integer idCategoria) {
        return videoRepository.findByCategoria(CategoriaVideo.valueOf(idCategoria))
                .stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Integer idCategoria) {
        return videoRepository.findByTurmaIdAndCategoria(turmaId, CategoriaVideo.valueOf(idCategoria))
                .stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponseDTO> findByTitulo(String titulo) {
        return videoRepository.findByTitulo(titulo)
                .stream()
                .map(VideoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }
}
