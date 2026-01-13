package br.unitins.topicos1.repository;

import java.time.LocalDate;
import java.util.List;

import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.StatusPagamento;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PagamentoRepository implements PanacheRepository<Pagamento> {

    public List<Pagamento> findByAlunoId(Long alunoId) {
        return find("aluno.id", alunoId).list();
    }

    public List<Pagamento> findByStatus(StatusPagamento status) {
        return find("status", status).list();
    }

    public List<Pagamento> findByAlunoIdAndStatus(Long alunoId, StatusPagamento status) {
        return find("aluno.id = ?1 AND status = ?2", alunoId, status).list();
    }

    public List<Pagamento> findByMesAno(String mes, Integer ano) {
        return find("mesReferencia = ?1 AND anoReferencia = ?2", mes, ano).list();
    }

    public List<Pagamento> findPendentesVencidos() {
        return find("status = ?1 AND dataVencimento < ?2", StatusPagamento.PENDENTE, LocalDate.now()).list();
    }

    public List<Pagamento> findByTurmaId(Long turmaId) {
        return find("aluno.turma.id", turmaId).list();
    }

    public List<Pagamento> findByProfessorId(Long professorId) {
        return find("aluno.turma.professor.id", professorId).list();
    }
}
