package br.unitins.topicos1.resource;

import java.util.ArrayList;

import br.unitins.topicos1.dto.VideoDTO;
import br.unitins.topicos1.dto.VideoResponseDTO;
import br.unitins.topicos1.service.AlunoService;
import br.unitins.topicos1.service.VideoService;
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
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/videos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VideoResource {

    @Inject
    VideoService videoService;

    @Inject
    AlunoService alunoService;

    @Inject
    JsonWebToken jwt;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid VideoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(videoService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid VideoDTO dto) {
        return Response.ok(videoService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        videoService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(videoService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(videoService.findAll()).build();
    }

    @GET
    @Path("/turma/{turmaId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaId(@PathParam("turmaId") Long turmaId) {
        return Response.ok(videoService.findByTurmaId(turmaId)).build();
    }

    @GET
    @Path("/categoria")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByCategoria(@QueryParam("idCategoria") Long idCategoria) {
        return Response.ok(videoService.findByCategoria(idCategoria)).build();
    }

    @GET
    @Path("/turma/{turmaId}/categoria")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndCategoria(
            @PathParam("turmaId") Long turmaId,
            @QueryParam("idCategoria") Long idCategoria) {
        return Response.ok(videoService.findByTurmaIdAndCategoria(turmaId, idCategoria)).build();
    }

    @GET
    @Path("/search")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTitulo(@QueryParam("titulo") String titulo) {
        return Response.ok(videoService.findByTitulo(titulo)).build();
    }

    @GET
    @Path("/subcategoria/{idSubcategoria}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findBySubcategoria(@PathParam("idSubcategoria") Long idSubcategoria) {
        return Response.ok(videoService.findBySubcategoria(idSubcategoria)).build();
    }

    @GET
    @Path("/turma/{turmaId}/subcategoria/{idSubcategoria}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndSubcategoria(
            @PathParam("turmaId") Long turmaId,
            @PathParam("idSubcategoria") Long idSubcategoria) {
        return Response.ok(videoService.findByTurmaIdAndSubcategoria(turmaId, idSubcategoria)).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"Aluno"})
    public Response getMeusVideos() {
        String username = jwt.getSubject();
        var aluno = alunoService.findByUsername(username);
        var todosVideos = new ArrayList<VideoResponseDTO>();
        if (aluno.turmas() != null && !aluno.turmas().isEmpty()) {
            for (var turma : aluno.turmas()) {
                todosVideos.addAll(videoService.findByTurmaId(turma.id()));
            }
        }
        return Response.ok(todosVideos).build();
    }
}
