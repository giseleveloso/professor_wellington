package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.SubcategoriaVideoDTO;
import br.unitins.topicos1.service.SubcategoriaVideoService;
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

@Path("/subcategorias-video")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SubcategoriaVideoResource {

    @Inject
    SubcategoriaVideoService subcategoriaService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid SubcategoriaVideoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(subcategoriaService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid SubcategoriaVideoDTO dto) {
        return Response.ok(subcategoriaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        subcategoriaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(subcategoriaService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor", "Aluno"})
    public Response findAll() {
        return Response.ok(subcategoriaService.findAll()).build();
    }

    @GET
    @Path("/categoria/{idCategoria}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByCategoriaRaiz(@PathParam("idCategoria") Long idCategoria) {
        return Response.ok(subcategoriaService.findByCategoriaRaiz(idCategoria)).build();
    }

    @GET
    @Path("/pai/{idPai}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findBySubcategoriaPai(@PathParam("idPai") Long idPai) {
        return Response.ok(subcategoriaService.findBySubcategoriaPai(idPai)).build();
    }

    @GET
    @Path("/raizes")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findRaizes(@QueryParam("idCategoria") Long idCategoria) {
        return Response.ok(subcategoriaService.findRaizes(idCategoria)).build();
    }

    @GET
    @Path("/search")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByNome(@QueryParam("nome") String nome) {
        return Response.ok(subcategoriaService.findByNome(nome)).build();
    }
}
