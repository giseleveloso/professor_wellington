package br.unitins.topicos1.repository;

import java.time.LocalDate;
import java.util.List;

import br.unitins.topicos1.model.Aula;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AulaRepository implements PanacheRepository<Aula> {

    public List<Aula> findByTurmaId(Long turmaId) {
        return find("turma.id", turmaId).list();
    }

    public List<Aula> findByData(LocalDate data) {
        return find("data", data).list();
    }

    public List<Aula> findByTurmaIdAndData(Long turmaId, LocalDate data) {
        return find("turma.id = ?1 AND data = ?2", turmaId, data).list();
    }

    public List<Aula> findByTurmaIdAndPeriodo(Long turmaId, LocalDate inicio, LocalDate fim) {
        return find("turma.id = ?1 AND data >= ?2 AND data <= ?3", turmaId, inicio, fim).list();
    }

    public List<Aula> findByProfessorId(Long professorId) {
        return find("turma.professor.id", professorId).list();
    }

    public List<Aula> findByProfessorIdAndData(Long professorId, LocalDate data) {
        return find("turma.professor.id = ?1 AND data = ?2", professorId, data).list();
    }

    public List<Aula> findByEscolaId(Long escolaId) {
        return find("turma.escola.id", escolaId).list();
    }

    public List<Aula> findByEscolaIdAndData(Long escolaId, LocalDate data) {
        return find("turma.escola.id = ?1 AND data = ?2", escolaId, data).list();
    }
}
