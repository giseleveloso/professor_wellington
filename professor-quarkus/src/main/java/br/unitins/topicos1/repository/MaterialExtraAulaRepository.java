package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.MaterialExtraAula;
import br.unitins.topicos1.model.TipoConteudo;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MaterialExtraAulaRepository implements PanacheRepository<MaterialExtraAula> {

    public List<MaterialExtraAula> findByTurmaId(Long turmaId) {
        return find("turma.id", turmaId).list();
    }

    public List<MaterialExtraAula> findByTipoConteudo(TipoConteudo tipo) {
        return find("tipoConteudo", tipo).list();
    }

    public List<MaterialExtraAula> findByTurmaIdAndTipoConteudo(Long turmaId, TipoConteudo tipo) {
        return find("turma.id = ?1 AND tipoConteudo = ?2", turmaId, tipo).list();
    }

    public List<MaterialExtraAula> findByTitulo(String titulo) {
        return find("LOWER(titulo) LIKE LOWER(?1)", "%" + titulo + "%").list();
    }

    public List<MaterialExtraAula> findByCategoria(CategoriaVideo categoria) {
        return find("categoria", categoria).list();
    }

    public List<MaterialExtraAula> findBySubcategoria(Long idSubcategoria) {
        return find("subcategoria.id", idSubcategoria).list();
    }

    public List<MaterialExtraAula> findByTurmaIdAndCategoria(Long turmaId, CategoriaVideo categoria) {
        return find("turma.id = ?1 AND categoria = ?2", turmaId, categoria).list();
    }

    public List<MaterialExtraAula> findByTurmaIdAndSubcategoria(Long turmaId, Long idSubcategoria) {
        return find("turma.id = ?1 AND subcategoria.id = ?2", turmaId, idSubcategoria).list();
    }

    public List<MaterialExtraAula> findByProfessorId(Long professorId) {
        return find("turma.professor.id", professorId).list();
    }

    public List<MaterialExtraAula> findByEscolaId(Long escolaId) {
        return find("turma.escola.id", escolaId).list();
    }
}
