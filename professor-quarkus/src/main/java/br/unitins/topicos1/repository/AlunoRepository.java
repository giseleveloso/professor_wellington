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
        return find("turma.id", turmaId).list();
    }

    public List<Aluno> findByProfessorId(Long professorId) {
        return find("turma.professor.id", professorId).list();
    }
}
