package br.unitins.topicos1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import br.unitins.topicos1.dto.PagamentoDTO;
import br.unitins.topicos1.dto.PagamentoResponseDTO;
import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.StatusPagamento;
import br.unitins.topicos1.repository.AlunoRepository;
import br.unitins.topicos1.repository.PagamentoRepository;
import br.unitins.topicos1.util.TenantContext;
import br.unitins.topicos1.validation.ValidationException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PagamentoServiceImpl implements PagamentoService {

    @Inject
    PagamentoRepository pagamentoRepository;

    @Inject
    AlunoRepository alunoRepository;

    @Inject
    TenantContext tenantContext;

    @Override
    @Transactional
    public PagamentoResponseDTO create(PagamentoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Aluno aluno = alunoRepository.findById(dto.idAluno());
        if (aluno == null) {
            throw new ValidationException("idAluno", "Aluno não encontrado");
        }

        // Verificar se o aluno pertence ao professor logado (via turma)
        if (aluno.getTurma() != null && !aluno.getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("idAluno", "Aluno não pertence ao professor logado");
        }

        Pagamento pagamento = new Pagamento();
        pagamento.setMesReferencia(dto.mesReferencia());
        pagamento.setAnoReferencia(dto.anoReferencia());
        pagamento.setValor(dto.valor());
        pagamento.setDataVencimento(dto.dataVencimento());
        pagamento.setDataPagamento(dto.dataPagamento());
        // Status padrão é PENDENTE se não fornecido ou inválido
        if (dto.idStatus() != null && dto.idStatus() >= 1 && dto.idStatus() <= 4) {
            pagamento.setStatus(StatusPagamento.valueOf(dto.idStatus()));
        } else {
            pagamento.setStatus(StatusPagamento.PENDENTE);
        }
        pagamento.setObservacao(dto.observacao());
        pagamento.setAluno(aluno);

        pagamentoRepository.persist(pagamento);
        return PagamentoResponseDTO.valueOf(pagamento);
    }

    @Override
    @Transactional
    public PagamentoResponseDTO update(Long id, PagamentoDTO dto) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        // Verificar se o pagamento pertence ao professor logado (via aluno.turma)
        if (pagamento.getAluno().getTurma() != null &&
            !pagamento.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para editar este pagamento");
        }

        pagamento.setMesReferencia(dto.mesReferencia());
        pagamento.setAnoReferencia(dto.anoReferencia());
        pagamento.setValor(dto.valor());
        pagamento.setDataVencimento(dto.dataVencimento());
        pagamento.setDataPagamento(dto.dataPagamento());
        pagamento.setStatus(StatusPagamento.valueOf(dto.idStatus()));
        pagamento.setObservacao(dto.observacao());

        return PagamentoResponseDTO.valueOf(pagamento);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        // Verificar se o pagamento pertence ao professor logado (via aluno.turma)
        if (pagamento.getAluno().getTurma() != null &&
            !pagamento.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para excluir este pagamento");
        }

        pagamentoRepository.delete(pagamento);
    }

    @Override
    public PagamentoResponseDTO findById(Long id) {
        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }
        return PagamentoResponseDTO.valueOf(pagamento);
    }

    @Override
    @Transactional
    public List<PagamentoResponseDTO> findAll() {
        // Atualiza status dos pagamentos vencidos antes de retornar
        atualizarStatusVencidos();

        List<Pagamento> pagamentos;
        var professor = tenantContext.getProfessorDoContexto();
        if (professor == null) {
            return List.of();
        }
        if (tenantContext.isSharedMode()) {
            pagamentos = pagamentoRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            pagamentos = pagamentoRepository.findByProfessorIdOrdered(professor.getId());
        }
        return pagamentos.stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByAlunoId(Long alunoId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return pagamentoRepository.findByAlunoId(alunoId)
                .stream()
                .filter(p -> p.getAluno().getTurma() != null &&
                        p.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByStatus(Integer idStatus) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return pagamentoRepository.findByStatus(StatusPagamento.valueOf(idStatus))
                .stream()
                .filter(p -> p.getAluno().getTurma() != null &&
                        p.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByMesAno(String mes, Integer ano) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return pagamentoRepository.findByMesAno(mes, ano)
                .stream()
                .filter(p -> p.getAluno().getTurma() != null &&
                        p.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findPendentesVencidos() {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return pagamentoRepository.findPendentesVencidos()
                .stream()
                .filter(p -> p.getAluno().getTurma() != null &&
                        p.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByTurmaId(Long turmaId) {
        var professorLogado = tenantContext.getProfessorDoContexto();
        return pagamentoRepository.findByTurmaId(turmaId)
                .stream()
                .filter(p -> p.getAluno().getTurma() != null &&
                        p.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId()))
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByProfessorId(Long professorId) {
        List<Pagamento> pagamentos;
        if (tenantContext.isSharedMode()) {
            pagamentos = pagamentoRepository.findByEscolaId(tenantContext.getCurrentEscola().getId());
        } else {
            pagamentos = pagamentoRepository.findByProfessorId(professorId);
        }
        return pagamentos.stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void marcarComoPago(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        // Verificar se o pagamento pertence ao professor logado
        if (pagamento.getAluno().getTurma() != null &&
            !pagamento.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para alterar este pagamento");
        }

        pagamento.setStatus(StatusPagamento.PAGO);
        pagamento.setDataPagamento(LocalDate.now());
    }

    @Override
    @Transactional
    public void marcarComoNaoPago(Long id) {
        var professorLogado = tenantContext.getProfessorDoContexto();

        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }

        // Verificar se o pagamento pertence ao professor logado
        if (pagamento.getAluno().getTurma() != null &&
            !pagamento.getAluno().getTurma().getProfessor().getId().equals(professorLogado.getId())) {
            throw new ValidationException("id", "Você não tem permissão para alterar este pagamento");
        }

        pagamento.setStatus(StatusPagamento.PENDENTE);
        pagamento.setDataPagamento(null);
    }

    @Override
    @Transactional
    public void atualizarStatusVencidos() {
        List<Pagamento> pendentesVencidos = pagamentoRepository.findPendentesVencidos();
        for (Pagamento pagamento : pendentesVencidos) {
            pagamento.setStatus(StatusPagamento.ATRASADO);
        }
    }
}
