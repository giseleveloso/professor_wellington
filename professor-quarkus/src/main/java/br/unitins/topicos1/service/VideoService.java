package br.unitins.topicos1.service;

import java.util.List;

import br.unitins.topicos1.dto.VideoDTO;
import br.unitins.topicos1.dto.VideoResponseDTO;

public interface VideoService {

    VideoResponseDTO create(VideoDTO dto);
    VideoResponseDTO update(Long id, VideoDTO dto);
    void delete(Long id);
    VideoResponseDTO findById(Long id);
    List<VideoResponseDTO> findAll();
    List<VideoResponseDTO> findByTurmaId(Long turmaId);
    List<VideoResponseDTO> findByCategoria(Integer idCategoria);
    List<VideoResponseDTO> findByTurmaIdAndCategoria(Long turmaId, Integer idCategoria);
    List<VideoResponseDTO> findByTitulo(String titulo);
}
