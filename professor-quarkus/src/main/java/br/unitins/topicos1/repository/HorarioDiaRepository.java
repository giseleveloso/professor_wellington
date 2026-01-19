package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.HorarioDia;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class HorarioDiaRepository implements PanacheRepository<HorarioDia> {

    public List<HorarioDia> findByTurmaId(Long turmaId) {
        return find("turma.id = ?1 ORDER BY diaSemana", turmaId).list();
    }

    public void deleteByTurmaId(Long turmaId) {
        delete("turma.id = ?1", turmaId);
    }
}
