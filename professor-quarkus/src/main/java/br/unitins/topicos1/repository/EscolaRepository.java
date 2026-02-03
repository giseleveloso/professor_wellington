package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.Escola;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EscolaRepository implements PanacheRepository<Escola> {

    public Escola findByNome(String nome) {
        return find("nome", nome).firstResult();
    }

    public List<Escola> findAllAtivas() {
        return find("ativo = true ORDER BY nome").list();
    }

    public List<Escola> findByNomeContaining(String nome) {
        return find("LOWER(nome) LIKE LOWER(?1)", "%" + nome + "%").list();
    }
}
