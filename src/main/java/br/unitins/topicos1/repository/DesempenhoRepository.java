package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.Desempenho;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DesempenhoRepository implements PanacheRepository<Desempenho> {

    public List<Desempenho> findByAulaId(Long aulaId) {
        return find("aula.id", aulaId).list();
    }

    public List<Desempenho> findByAlunoId(Long alunoId) {
        return find("aluno.id", alunoId).list();
    }

    public Desempenho findByAulaIdAndAlunoId(Long aulaId, Long alunoId) {
        return find("aula.id = ?1 AND aluno.id = ?2", aulaId, alunoId).firstResult();
    }

    // Para aluno - não retorna comentários privados
    public List<Desempenho> findByAlunoIdPublico(Long alunoId) {
        return find("aluno.id = ?1 AND (privado = false OR privado IS NULL)", alunoId).list();
    }
}
