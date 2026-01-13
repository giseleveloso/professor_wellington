package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.DesempenhoDTO;
import br.unitins.topicos1.service.DesempenhoService;
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

@Path("/desempenhos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DesempenhoResource {

    @Inject
    DesempenhoService desempenhoService;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid DesempenhoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(desempenhoService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid DesempenhoDTO dto) {
        return Response.ok(desempenhoService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        desempenhoService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(desempenhoService.findById(id)).build();
    }

    @GET
    @Path("/aula/{aulaId}")
    @RolesAllowed({"Professor"})
    public Response findByAulaId(@PathParam("aulaId") Long aulaId) {
        return Response.ok(desempenhoService.findByAulaId(aulaId)).build();
    }

    @GET
    @Path("/aluno/{alunoId}")
    @RolesAllowed({"Professor"})
    public Response findByAlunoId(@PathParam("alunoId") Long alunoId) {
        return Response.ok(desempenhoService.findByAlunoId(alunoId)).build();
    }

    // Para alunos - não mostra comentários privados
    @GET
    @Path("/meu/{alunoId}")
    @RolesAllowed({"Aluno"})
    public Response findByAlunoIdParaAluno(@PathParam("alunoId") Long alunoId) {
        return Response.ok(desempenhoService.findByAlunoIdParaAluno(alunoId)).build();
    }

    @GET
    @Path("/aula/{aulaId}/aluno/{alunoId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByAulaIdAndAlunoId(
            @PathParam("aulaId") Long aulaId,
            @PathParam("alunoId") Long alunoId) {
        return Response.ok(desempenhoService.findByAulaIdAndAlunoId(aulaId, alunoId)).build();
    }
}
