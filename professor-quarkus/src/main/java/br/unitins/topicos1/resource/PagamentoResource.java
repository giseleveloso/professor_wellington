package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.PagamentoDTO;
import br.unitins.topicos1.service.PagamentoService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/pagamentos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PagamentoResource {

    @Inject
    PagamentoService pagamentoService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid PagamentoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(pagamentoService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid PagamentoDTO dto) {
        return Response.ok(pagamentoService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        pagamentoService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(pagamentoService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(pagamentoService.findAll()).build();
    }

    @GET
    @Path("/aluno/{alunoId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByAlunoId(@PathParam("alunoId") Long alunoId) {
        return Response.ok(pagamentoService.findByAlunoId(alunoId)).build();
    }

    @GET
    @Path("/status")
    @RolesAllowed({"Professor"})
    public Response findByStatus(@QueryParam("idStatus") Integer idStatus) {
        return Response.ok(pagamentoService.findByStatus(idStatus)).build();
    }

    @GET
    @Path("/periodo")
    @RolesAllowed({"Professor"})
    public Response findByMesAno(@QueryParam("mes") String mes, @QueryParam("ano") Integer ano) {
        return Response.ok(pagamentoService.findByMesAno(mes, ano)).build();
    }

    @GET
    @Path("/vencidos")
    @RolesAllowed({"Professor"})
    public Response findPendentesVencidos() {
        return Response.ok(pagamentoService.findPendentesVencidos()).build();
    }

    @GET
    @Path("/turma/{turmaId}")
    @RolesAllowed({"Professor"})
    public Response findByTurmaId(@PathParam("turmaId") Long turmaId) {
        return Response.ok(pagamentoService.findByTurmaId(turmaId)).build();
    }

    @GET
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response findByProfessorId(@PathParam("professorId") Long professorId) {
        return Response.ok(pagamentoService.findByProfessorId(professorId)).build();
    }

    @PATCH
    @Path("/{id}/pagar")
    @RolesAllowed({"Professor"})
    public Response marcarComoPago(@PathParam("id") Long id) {
        pagamentoService.marcarComoPago(id);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/desfazer")
    @RolesAllowed({"Professor"})
    public Response marcarComoNaoPago(@PathParam("id") Long id) {
        pagamentoService.marcarComoNaoPago(id);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/atualizar-vencidos")
    @RolesAllowed({"Professor"})
    public Response atualizarStatusVencidos() {
        pagamentoService.atualizarStatusVencidos();
        return Response.noContent().build();
    }
}
