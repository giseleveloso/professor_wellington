package br.unitins.topicos1.resource;

import org.eclipse.microprofile.jwt.JsonWebToken;

import br.unitins.topicos1.dto.ProfessorDTO;
import br.unitins.topicos1.dto.UpdatePasswordDTO;
import br.unitins.topicos1.dto.UpdateUsernameDTO;
import br.unitins.topicos1.service.ProfessorService;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProfessorResource {

    @Inject
    ProfessorService professorService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    @RolesAllowed({"Professor"})
    public Response getCurrentProfessor() {
        String username = jwt.getSubject();
        return Response.ok(professorService.findByUsername(username)).build();
    }

    @POST
    public Response create(@Valid ProfessorDTO dto) {
        return Response.status(Status.CREATED)
                .entity(professorService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid ProfessorDTO dto) {
        return Response.ok(professorService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        professorService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(professorService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(professorService.findAll()).build();
    }

    @PATCH
    @Path("/{id}/senha")
    @RolesAllowed({"Professor"})
    public Response updatePassword(@PathParam("id") Long id, @Valid UpdatePasswordDTO dto) {
        professorService.updatePassword(id, dto.novaSenha());
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/username")
    @RolesAllowed({"Professor"})
    public Response updateUsername(@PathParam("id") Long id, @Valid UpdateUsernameDTO dto) {
        professorService.updateUsername(id, dto.novoUsername());
        return Response.noContent().build();
    }
}
