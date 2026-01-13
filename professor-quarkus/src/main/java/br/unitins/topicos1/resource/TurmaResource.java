package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.TurmaDTO;
import br.unitins.topicos1.service.TurmaService;
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
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/turmas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TurmaResource {

    @Inject
    TurmaService turmaService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid TurmaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(turmaService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid TurmaDTO dto) {
        return Response.ok(turmaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        turmaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(turmaService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(turmaService.findAll()).build();
    }

    @GET
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response findByProfessorId(@PathParam("professorId") Long professorId) {
        return Response.ok(turmaService.findByProfessorId(professorId)).build();
    }

    @GET
    @Path("/search/idioma")
    @RolesAllowed({"Professor"})
    public Response findByIdioma(@QueryParam("idIdioma") Integer idIdioma) {
        return Response.ok(turmaService.findByIdioma(idIdioma)).build();
    }

    @GET
    @Path("/search/nivel")
    @RolesAllowed({"Professor"})
    public Response findByNivel(@QueryParam("idNivel") Integer idNivel) {
        return Response.ok(turmaService.findByNivel(idNivel)).build();
    }

    @GET
    @Path("/search/nome")
    @RolesAllowed({"Professor"})
    public Response findByNome(@QueryParam("nome") String nome) {
        return Response.ok(turmaService.findByNome(nome)).build();
    }
}
