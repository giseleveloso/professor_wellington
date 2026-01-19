package br.unitins.topicos1.resource;

import java.util.List;

import br.unitins.topicos1.dto.NivelTurmaDTO;
import br.unitins.topicos1.service.NivelTurmaService;
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

@Path("/niveis-turma")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NivelTurmaResource {

    @Inject
    NivelTurmaService nivelTurmaService;

    @POST
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response create(@PathParam("professorId") Long professorId, @Valid NivelTurmaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(nivelTurmaService.create(dto, professorId))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid NivelTurmaDTO dto) {
        return Response.ok(nivelTurmaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        nivelTurmaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(nivelTurmaService.findById(id)).build();
    }

    @GET
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response findByProfessorId(@PathParam("professorId") Long professorId) {
        return Response.ok(nivelTurmaService.findByProfessorId(professorId)).build();
    }

    @POST
    @Path("/professor/{professorId}/padrao")
    @RolesAllowed({"Professor"})
    public Response criarNiveisPadrao(@PathParam("professorId") Long professorId) {
        nivelTurmaService.criarNiveisPadrao(professorId);
        return Response.ok().build();
    }

    @PUT
    @Path("/professor/{professorId}/reordenar")
    @RolesAllowed({"Professor"})
    public Response reordenar(@PathParam("professorId") Long professorId, List<Long> ids) {
        nivelTurmaService.reordenar(professorId, ids);
        return Response.noContent().build();
    }
}
