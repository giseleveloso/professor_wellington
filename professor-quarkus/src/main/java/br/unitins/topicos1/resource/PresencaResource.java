package br.unitins.topicos1.resource;

import java.util.List;

import br.unitins.topicos1.dto.PresencaDTO;
import br.unitins.topicos1.service.PresencaService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/presencas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PresencaResource {

    @Inject
    PresencaService presencaService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid PresencaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(presencaService.create(dto))
                .build();
    }

    @POST
    @Path("/lote/{aulaId}")
    @RolesAllowed({"Professor"})
    public Response registrarEmLote(@PathParam("aulaId") Long aulaId, List<PresencaDTO> presencas) {
        presencaService.registrarPresencaEmLote(aulaId, presencas);
        return Response.ok().build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid PresencaDTO dto) {
        return Response.ok(presencaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        presencaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(presencaService.findById(id)).build();
    }

    @GET
    @Path("/aula/{aulaId}")
    @RolesAllowed({"Professor"})
    public Response findByAulaId(@PathParam("aulaId") Long aulaId) {
        return Response.ok(presencaService.findByAulaId(aulaId)).build();
    }

    @GET
    @Path("/aluno/{alunoId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByAlunoId(@PathParam("alunoId") Long alunoId) {
        return Response.ok(presencaService.findByAlunoId(alunoId)).build();
    }

    @GET
    @Path("/aula/{aulaId}/aluno/{alunoId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByAulaIdAndAlunoId(
            @PathParam("aulaId") Long aulaId,
            @PathParam("alunoId") Long alunoId) {
        return Response.ok(presencaService.findByAulaIdAndAlunoId(aulaId, alunoId)).build();
    }

    @GET
    @Path("/aluno/{alunoId}/contagem")
    @RolesAllowed({"Professor", "Aluno"})
    public Response getContagem(@PathParam("alunoId") Long alunoId) {
        long presencas = presencaService.countPresencasByAlunoId(alunoId);
        long faltas = presencaService.countFaltasByAlunoId(alunoId);
        return Response.ok()
                .entity(new ContagemPresencaDTO(presencas, faltas))
                .build();
    }

    public record ContagemPresencaDTO(long presencas, long faltas) {}
}
