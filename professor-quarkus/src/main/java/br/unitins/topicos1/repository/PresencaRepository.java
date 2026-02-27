package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.Presenca;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PresencaRepository implements PanacheRepository<Presenca> {

    public List<Presenca> findByAulaId(Long aulaId) {
        return find("aula.id", aulaId).list();
    }

    public List<Presenca> findByAlunoId(Long alunoId) {
        return find("aluno.id", alunoId).list();
    }

    public Presenca findByAulaIdAndAlunoId(Long aulaId, Long alunoId) {
        return find("aula.id = ?1 AND aluno.id = ?2", aulaId, alunoId).firstResult();
    }

    public long countPresencasByAlunoId(Long alunoId) {
        return count("aluno.id = ?1 AND presente = true", alunoId);
    }

    public long countFaltasByAlunoId(Long alunoId) {
        return count("aluno.id = ?1 AND presente = false", alunoId);
    }

    public long countDeveresFeitos(Long alunoId) {
        return count("aluno.id = ?1 AND deverCasa = ?2", alunoId, br.unitins.topicos1.model.StatusDeverCasa.FEITO);
    }

    public long countDeveresNaoFeitos(Long alunoId) {
        return count("aluno.id = ?1 AND deverCasa = ?2", alunoId, br.unitins.topicos1.model.StatusDeverCasa.NAO_FEITO);
    }

    public long countDeveresAplicaveis(Long alunoId) {
        return count("aluno.id = ?1 AND deverCasa != ?2", alunoId, br.unitins.topicos1.model.StatusDeverCasa.NAO_APLICA);
    }
}
