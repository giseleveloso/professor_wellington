package br.unitins.topicos1.repository;

import br.unitins.topicos1.model.Professor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProfessorRepository implements PanacheRepository<Professor> {

    public Professor findByUsername(String username) {
        return find("usuario.username", username).firstResult();
    }

    public Professor findByEmail(String email) {
        return find("email", email).firstResult();
    }

    public Professor findByUsuarioId(Long usuarioId) {
        return find("usuario.id", usuarioId).firstResult();
    }
}
