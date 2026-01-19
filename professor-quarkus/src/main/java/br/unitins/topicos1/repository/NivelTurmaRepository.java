package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.NivelTurma;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NivelTurmaRepository implements PanacheRepository<NivelTurma> {

    public List<NivelTurma> findByProfessorId(Long professorId) {
        return find("professor.id = ?1 ORDER BY ordem", professorId).list();
    }

    public NivelTurma findByCodigoAndProfessorId(String codigo, Long professorId) {
        return find("codigo = ?1 and professor.id = ?2", codigo, professorId).firstResult();
    }

    public Long countByProfessorId(Long professorId) {
        return count("professor.id = ?1", professorId);
    }
}
