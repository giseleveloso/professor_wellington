package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.Video;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class VideoRepository implements PanacheRepository<Video> {

    public List<Video> findByTurmaId(Long turmaId) {
        return find("turma.id", turmaId).list();
    }

    public List<Video> findByCategoria(CategoriaVideo categoria) {
        return find("categoria", categoria).list();
    }

    public List<Video> findByTurmaIdAndCategoria(Long turmaId, CategoriaVideo categoria) {
        return find("turma.id = ?1 AND categoria = ?2", turmaId, categoria).list();
    }

    public List<Video> findByTitulo(String titulo) {
        return find("LOWER(titulo) LIKE LOWER(?1)", "%" + titulo + "%").list();
    }

    public List<Video> findBySubcategoria(Long idSubcategoria) {
        return find("subcategoria.id", idSubcategoria).list();
    }

    public List<Video> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria) {
        return find("turma.id = ?1 AND subcategoria.id = ?2", turmaId, idSubcategoria).list();
    }

    public List<Video> findByProfessorId(Long professorId) {
        return find("turma.professor.id", professorId).list();
    }

    public List<Video> findByEscolaId(Long escolaId) {
        return find("turma.escola.id", escolaId).list();
    }
}
