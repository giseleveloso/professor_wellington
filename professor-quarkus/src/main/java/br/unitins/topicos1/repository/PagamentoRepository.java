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
        return find("aluno.id = ?1 ORDER BY dataVencimento DESC", alunoId).list();
    }

    public List<Pagamento> findByStatus(StatusPagamento status) {
        return find("status = ?1 ORDER BY dataVencimento ASC", status).list();
    }

    public List<Pagamento> findByAlunoIdAndStatus(Long alunoId, StatusPagamento status) {
        return find("aluno.id = ?1 AND status = ?2 ORDER BY dataVencimento ASC", alunoId, status).list();
    }

    public List<Pagamento> findByMesAno(String mes, Integer ano) {
        return find("mesReferencia = ?1 AND anoReferencia = ?2 ORDER BY dataVencimento ASC", mes, ano).list();
    }

    public List<Pagamento> findPendentesVencidos() {
        return find("status = ?1 AND dataVencimento < ?2 ORDER BY dataVencimento ASC", StatusPagamento.PENDENTE, LocalDate.now()).list();
    }

    public List<Pagamento> findByTurmaId(Long turmaId) {
        return find("aluno.turma.id = ?1 ORDER BY dataVencimento ASC", turmaId).list();
    }

    public List<Pagamento> findByProfessorId(Long professorId) {
        return find("aluno.turma.professor.id = ?1 ORDER BY dataVencimento ASC", professorId).list();
    }
    
    public List<Pagamento> findAllOrdered() {
        return find("ORDER BY dataVencimento ASC").list();
    }

    public List<Pagamento> findByEscolaId(Long escolaId) {
        return find("aluno.turma.escola.id = ?1 ORDER BY dataVencimento ASC", escolaId).list();
    }

    public List<Pagamento> findByProfessorIdOrdered(Long professorId) {
        return find("aluno.turma.professor.id = ?1 ORDER BY dataVencimento ASC", professorId).list();
    }
}
