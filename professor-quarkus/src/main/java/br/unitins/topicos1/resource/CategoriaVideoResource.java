package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.CategoriaVideoDTO;
import br.unitins.topicos1.service.CategoriaVideoService;
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

@Path("/categorias-video")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoriaVideoResource {

    @Inject
    CategoriaVideoService categoriaService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid CategoriaVideoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(categoriaService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid CategoriaVideoDTO dto) {
        return Response.ok(categoriaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        categoriaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(categoriaService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor", "Aluno"})
    public Response findAll() {
        return Response.ok(categoriaService.findAll()).build();
    }

    @GET
    @Path("/search")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByNome(@QueryParam("nome") String nome) {
        return Response.ok(categoriaService.findByNome(nome)).build();
    }
}
