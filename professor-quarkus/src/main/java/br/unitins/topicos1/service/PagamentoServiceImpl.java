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

    @Override
    @Transactional
    public PagamentoResponseDTO create(PagamentoDTO dto) {
        Aluno aluno = alunoRepository.findById(dto.idAluno());
        if (aluno == null) {
            throw new ValidationException("idAluno", "Aluno não encontrado");
        }

        Pagamento pagamento = new Pagamento();
        pagamento.setMesReferencia(dto.mesReferencia());
        pagamento.setAnoReferencia(dto.anoReferencia());
        pagamento.setValor(dto.valor());
        pagamento.setDataVencimento(dto.dataVencimento());
        pagamento.setDataPagamento(dto.dataPagamento());
        pagamento.setStatus(StatusPagamento.valueOf(dto.idStatus()));
        pagamento.setObservacao(dto.observacao());
        pagamento.setAluno(aluno);

        pagamentoRepository.persist(pagamento);
        return PagamentoResponseDTO.valueOf(pagamento);
    }

    @Override
    @Transactional
    public PagamentoResponseDTO update(Long id, PagamentoDTO dto) {
        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
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
        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
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
    public List<PagamentoResponseDTO> findAll() {
        return pagamentoRepository.listAll()
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByAlunoId(Long alunoId) {
        return pagamentoRepository.findByAlunoId(alunoId)
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByStatus(Integer idStatus) {
        return pagamentoRepository.findByStatus(StatusPagamento.valueOf(idStatus))
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByMesAno(String mes, Integer ano) {
        return pagamentoRepository.findByMesAno(mes, ano)
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findPendentesVencidos() {
        return pagamentoRepository.findPendentesVencidos()
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByTurmaId(Long turmaId) {
        return pagamentoRepository.findByTurmaId(turmaId)
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<PagamentoResponseDTO> findByProfessorId(Long professorId) {
        return pagamentoRepository.findByProfessorId(professorId)
                .stream()
                .map(PagamentoResponseDTO::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void marcarComoPago(Long id) {
        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            throw new ValidationException("id", "Pagamento não encontrado");
        }
        pagamento.setStatus(StatusPagamento.PAGO);
        pagamento.setDataPagamento(LocalDate.now());
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
