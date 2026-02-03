package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.CategoriaVideo;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CategoriaVideoRepository implements PanacheRepository<CategoriaVideo> {

    public CategoriaVideo findByNome(String nome) {
        return find("LOWER(nome) = LOWER(?1)", nome).firstResult();
    }

    public List<CategoriaVideo> findByNomeContaining(String nome) {
        return find("LOWER(nome) LIKE LOWER(?1)", "%" + nome + "%").list();
    }

    public List<CategoriaVideo> findByProfessorId(Long professorId) {
        return find("professor.id = ?1 ORDER BY nome", professorId).list();
    }

    public List<CategoriaVideo> findByEscolaId(Long escolaId) {
        return find("escola.id = ?1 ORDER BY nome", escolaId).list();
    }

    public CategoriaVideo findByNomeAndProfessorId(String nome, Long professorId) {
        return find("LOWER(nome) = LOWER(?1) AND professor.id = ?2", nome, professorId).firstResult();
    }

    public CategoriaVideo findByNomeAndEscolaId(String nome, Long escolaId) {
        return find("LOWER(nome) = LOWER(?1) AND escola.id = ?2", nome, escolaId).firstResult();
    }
}
