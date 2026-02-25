package br.unitins.topicos1.resource;

import java.time.LocalDate;
import java.util.List;

import br.unitins.topicos1.model.Aula;
import br.unitins.topicos1.model.Pagamento;
import br.unitins.topicos1.repository.AulaRepository;
import br.unitins.topicos1.repository.PagamentoRepository;
import br.unitins.topicos1.service.EmailService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/email")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Professor")
public class EmailResource {

    @Inject
    EmailService emailService;

    @Inject
    PagamentoRepository pagamentoRepository;

    @Inject
    AulaRepository aulaRepository;

    @POST
    @Path("/pagamentos/atrasados")
    public Response enviarPagamentosAtrasados() {
        int enviados = emailService.enviarPagamentosAtrasados();
        return Response.ok("{\"enviados\":" + enviados + "}").build();
    }

    @POST
    @Path("/pagamentos/a-vencer")
    public Response enviarPagamentosAVencer(@QueryParam("dias") @DefaultValue("3") int dias) {
        int enviados = emailService.enviarPagamentosAVencer(dias);
        return Response.ok("{\"enviados\":" + enviados + "}").build();
    }

    @POST
    @Path("/pagamento/{id}/cobrar")
    public Response cobrarPagamento(@PathParam("id") Long id) {
        Pagamento pagamento = pagamentoRepository.findById(id);
        if (pagamento == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Pagamento não encontrado\"}").build();
        }
        emailService.enviarCobrancaPagamento(pagamento);
        return Response.ok("{\"enviados\":1}").build();
    }

    @POST
    @Path("/turma/{id}/lembretes-aula")
    public Response enviarLembretesAulaTurma(@PathParam("id") Long turmaId) {
        LocalDate amanha = LocalDate.now().plusDays(1);
        List<Aula> aulas = aulaRepository.findByTurmaIdAndData(turmaId, amanha);
        int enviados = 0;
        for (Aula aula : aulas) {
            emailService.enviarLembreteAula(aula);
            enviados++;
        }
        return Response.ok("{\"enviados\":" + enviados + "}").build();
    }
}
