package br.unitins.topicos1.service;

import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.model.Turma;

public interface EmailService {

    void enviarCobrancaPagamento(Pagamento pagamento);

    void enviarLembretePagamento(Pagamento pagamento, int diasParaVencer);

    void enviarMudancaHorario(Turma turma, String horarioAntigo);

    void enviarLembreteAula(Aula aula);

    int enviarPagamentosAtrasados();

    int enviarPagamentosAVencer(int dias);

    int enviarLembretesAulaAmanha();
}
