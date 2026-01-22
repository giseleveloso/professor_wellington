package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.AlunoDTO;
import br.unitins.topicos1.dto.UpdatePasswordDTO;
import br.unitins.topicos1.dto.UpdateUsernameDTO;
import br.unitins.topicos1.service.AlunoService;
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
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/alunos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlunoResource {

    @Inject
    AlunoService alunoService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    @RolesAllowed({"Aluno"})
    public Response getCurrentAluno() {
        String username = jwt.getSubject();
        return Response.ok(alunoService.findByUsername(username)).build();
    }

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid AlunoDTO dto) {
        return Response.status(Status.CREATED)
                .entity(alunoService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response update(@PathParam("id") Long id, @Valid AlunoDTO dto) {
        return Response.ok(alunoService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        alunoService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(alunoService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(alunoService.findAll()).build();
    }

    @GET
    @Path("/turma/{turmaId}")
    @RolesAllowed({"Professor"})
    public Response findByTurmaId(@PathParam("turmaId") Long turmaId) {
        return Response.ok(alunoService.findByTurmaId(turmaId)).build();
    }

    @GET
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response findByProfessorId(@PathParam("professorId") Long professorId) {
        return Response.ok(alunoService.findByProfessorId(professorId)).build();
    }

    @PATCH
    @Path("/{id}/senha")
    @RolesAllowed({"Professor", "Aluno"})
    public Response updatePassword(@PathParam("id") Long id, @Valid UpdatePasswordDTO dto) {
        alunoService.updatePassword(id, dto.novaSenha());
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/username")
    @RolesAllowed({"Professor", "Aluno"})
    public Response updateUsername(@PathParam("id") Long id, @Valid UpdateUsernameDTO dto) {
        alunoService.updateUsername(id, dto.novoUsername());
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/transferir")
    @RolesAllowed({"Professor"})
    public Response transferirTurma(@PathParam("id") Long id, @QueryParam("novaTurmaId") Long novaTurmaId) {
        alunoService.transferirTurma(id, novaTurmaId);
        return Response.noContent().build();
    }
}
