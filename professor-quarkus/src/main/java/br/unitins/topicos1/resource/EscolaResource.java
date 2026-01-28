package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.EscolaDTO;
import br.unitins.topicos1.service.EscolaService;
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

@Path("/escolas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EscolaResource {

    @Inject
    EscolaService escolaService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid EscolaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(escolaService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid EscolaDTO dto) {
        return Response.ok(escolaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        escolaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(escolaService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(escolaService.findAll()).build();
    }

    @GET
    @Path("/ativas")
    @RolesAllowed({"Professor"})
    public Response findAllAtivas() {
        return Response.ok(escolaService.findAllAtivas()).build();
    }

    @PUT
    @Path("/{id}/ativar")
    @RolesAllowed({"Professor"})
    public Response ativar(@PathParam("id") Long id) {
        escolaService.ativarDesativar(id, true);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}/desativar")
    @RolesAllowed({"Professor"})
    public Response desativar(@PathParam("id") Long id) {
        escolaService.ativarDesativar(id, false);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{escolaId}/professores/{professorId}")
    @RolesAllowed({"Professor"})
    public Response adicionarProfessor(@PathParam("escolaId") Long escolaId, @PathParam("professorId") Long professorId) {
        escolaService.adicionarProfessor(escolaId, professorId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/professores/{professorId}")
    @RolesAllowed({"Professor"})
    public Response removerProfessor(@PathParam("professorId") Long professorId) {
        escolaService.removerProfessor(professorId);
        return Response.noContent().build();
    }
}
