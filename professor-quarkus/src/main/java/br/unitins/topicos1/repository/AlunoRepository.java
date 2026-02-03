package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.Aluno;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AlunoRepository implements PanacheRepository<Aluno> {

    public Aluno findByUsername(String username) {
        return find("usuario.username", username).firstResult();
    }

    public Aluno findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public Aluno findByUsuarioId(Long usuarioId) {
        return find("usuario.id", usuarioId).firstResult();
    }

    public List<Aluno> findByTurmaId(Long turmaId) {
        // Busca alunos pela turma principal (legado) ou pela tabela de associação many-to-many
        return find("turma.id = ?1 OR ?1 IN (SELECT t.id FROM turmas t)", turmaId).list();
    }

    public List<Aluno> findByProfessorId(Long professorId) {
        return find("turma.professor.id", professorId).list();
    }
    
    // Busca alunos que estão associados a uma turma (inclui many-to-many)
    public List<Aluno> findByTurmaIdIncluindoMultiplas(Long turmaId) {
        return getEntityManager().createQuery(
            "SELECT DISTINCT a FROM Aluno a LEFT JOIN a.turmas t WHERE a.turma.id = :turmaId OR t.id = :turmaId",
            Aluno.class)
            .setParameter("turmaId", turmaId)
            .getResultList();
    }

    public List<Aluno> findByEscolaId(Long escolaId) {
        return find("turma.escola.id", escolaId).list();
    }
}
