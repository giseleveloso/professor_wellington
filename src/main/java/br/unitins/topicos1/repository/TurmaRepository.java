package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.Idioma;
import br.unitins.topicos1.model.Nivel;
import br.unitins.topicos1.model.Turma;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TurmaRepository implements PanacheRepository<Turma> {

    public List<Turma> findByProfessorId(Long professorId) {
        return find("professor.id", professorId).list();
    }

    public List<Turma> findByIdioma(Idioma idioma) {
        return find("idioma", idioma).list();
    }

    public List<Turma> findByNivel(Nivel nivel) {
        return find("nivel", nivel).list();
    }

    public List<Turma> findByNome(String nome) {
        return find("LOWER(nome) LIKE LOWER(?1)", "%" + nome + "%").list();
    }
}
