package br.unitins.topicos1.resource;

import java.time.LocalDate;
import java.util.ArrayList;

import br.unitins.topicos1.dto.AulaDTO;
import br.unitins.topicos1.service.AlunoService;
import br.unitins.topicos1.service.AulaService;
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

@Path("/aulas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AulaResource {

    @Inject
    AulaService aulaService;

    @Inject
    AlunoService alunoService;

    @Inject
    JsonWebToken jwt;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid AulaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(aulaService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid AulaDTO dto) {
        return Response.ok(aulaService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        aulaService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(aulaService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(aulaService.findAll()).build();
    }

    @GET
    @Path("/turma/{turmaId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaId(@PathParam("turmaId") Long turmaId) {
        return Response.ok(aulaService.findByTurmaId(turmaId)).build();
    }

    @GET
    @Path("/data")
    @RolesAllowed({"Professor"})
    public Response findByData(@QueryParam("data") String dataStr) {
        LocalDate data = LocalDate.parse(dataStr);
        return Response.ok(aulaService.findByData(data)).build();
    }

    @GET
    @Path("/turma/{turmaId}/periodo")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndPeriodo(
            @PathParam("turmaId") Long turmaId,
            @QueryParam("inicio") String inicioStr,
            @QueryParam("fim") String fimStr) {
        LocalDate inicio = LocalDate.parse(inicioStr);
        LocalDate fim = LocalDate.parse(fimStr);
        return Response.ok(aulaService.findByTurmaIdAndPeriodo(turmaId, inicio, fim)).build();
    }

    @GET
    @Path("/periodo")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByPeriodo(
            @QueryParam("inicio") String inicioStr,
            @QueryParam("fim") String fimStr) {
        LocalDate inicio = LocalDate.parse(inicioStr);
        LocalDate fim = LocalDate.parse(fimStr);
        return Response.ok(aulaService.findByPeriodo(inicio, fim)).build();
    }

    @GET
    @Path("/professor/{professorId}")
    @RolesAllowed({"Professor"})
    public Response findByProfessorId(@PathParam("professorId") Long professorId) {
        return Response.ok(aulaService.findByProfessorId(professorId)).build();
    }

    @GET
    @Path("/professor/{professorId}/data")
    @RolesAllowed({"Professor"})
    public Response findByProfessorIdAndData(
            @PathParam("professorId") Long professorId,
            @QueryParam("data") String dataStr) {
        LocalDate data = LocalDate.parse(dataStr);
        return Response.ok(aulaService.findByProfessorIdAndData(professorId, data)).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"Aluno"})
    public Response getMinhasAulas() {
        String username = jwt.getSubject();
        var aluno = alunoService.findByUsername(username);
        var todasAulas = new ArrayList<br.unitins.topicos1.dto.AulaResponseDTO>();
        if (aluno.turmas() != null && !aluno.turmas().isEmpty()) {
            for (var turma : aluno.turmas()) {
                todasAulas.addAll(aulaService.findByTurmaId(turma.id()));
            }
        }
        return Response.ok(todasAulas).build();
    }
}
