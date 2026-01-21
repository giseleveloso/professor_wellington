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
}
