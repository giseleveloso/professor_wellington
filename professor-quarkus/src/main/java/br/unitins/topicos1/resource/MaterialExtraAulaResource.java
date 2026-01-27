package br.unitins.topicos1.resource;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;
import org.eclipse.microprofile.jwt.JsonWebToken;

import br.unitins.topicos1.dto.MaterialExtraAulaDTO;
import br.unitins.topicos1.dto.MaterialExtraAulaResponseDTO;
import br.unitins.topicos1.form.MaterialFileForm;
import br.unitins.topicos1.service.AlunoService;
import br.unitins.topicos1.service.MaterialExtraAulaService;
import br.unitins.topicos1.service.MaterialFileService;
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
import jakarta.ws.rs.core.Response.ResponseBuilder;
import jakarta.ws.rs.core.Response.Status;

@Path("/materiais")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MaterialExtraAulaResource {

    @Inject
    MaterialExtraAulaService materialService;

    @Inject
    MaterialFileService materialFileService;

    @Inject
    AlunoService alunoService;

    @Inject
    JsonWebToken jwt;

    @POST
    @RolesAllowed({"Professor"})
    public Response create(@Valid MaterialExtraAulaDTO dto) {
        return Response.status(Status.CREATED)
                .entity(materialService.create(dto))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response update(@PathParam("id") Long id, @Valid MaterialExtraAulaDTO dto) {
        return Response.ok(materialService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"Professor"})
    public Response delete(@PathParam("id") Long id) {
        materialService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(materialService.findById(id)).build();
    }

    @GET
    @RolesAllowed({"Professor"})
    public Response findAll() {
        return Response.ok(materialService.findAll()).build();
    }

    @GET
    @Path("/turma/{turmaId}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaId(@PathParam("turmaId") Long turmaId) {
        return Response.ok(materialService.findByTurmaId(turmaId)).build();
    }

    @GET
    @Path("/tipo")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTipoConteudo(@QueryParam("idTipoConteudo") Integer idTipoConteudo) {
        return Response.ok(materialService.findByTipoConteudo(idTipoConteudo)).build();
    }

    @GET
    @Path("/turma/{turmaId}/tipo")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndTipoConteudo(
            @PathParam("turmaId") Long turmaId,
            @QueryParam("idTipoConteudo") Integer idTipoConteudo) {
        return Response.ok(materialService.findByTurmaIdAndTipoConteudo(turmaId, idTipoConteudo)).build();
    }

    @GET
    @Path("/search")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTitulo(@QueryParam("titulo") String titulo) {
        return Response.ok(materialService.findByTitulo(titulo)).build();
    }

    @GET
    @Path("/categoria")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByCategoria(@QueryParam("idCategoria") Long idCategoria) {
        return Response.ok(materialService.findByCategoria(idCategoria)).build();
    }

    @GET
    @Path("/subcategoria/{idSubcategoria}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findBySubcategoria(@PathParam("idSubcategoria") Long idSubcategoria) {
        return Response.ok(materialService.findBySubcategoria(idSubcategoria)).build();
    }

    @GET
    @Path("/turma/{turmaId}/categoria")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndCategoria(
            @PathParam("turmaId") Long turmaId,
            @QueryParam("idCategoria") Long idCategoria) {
        return Response.ok(materialService.findByTurmaIdAndCategoria(turmaId, idCategoria)).build();
    }

    @GET
    @Path("/turma/{turmaId}/subcategoria/{idSubcategoria}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response findByTurmaIdAndSubcategoria(
            @PathParam("turmaId") Long turmaId,
            @PathParam("idSubcategoria") Long idSubcategoria) {
        return Response.ok(materialService.findByTurmaIdAndSubcategoria(turmaId, idSubcategoria)).build();
    }

    @PATCH
    @Path("/{id}/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed({"Professor"})
    public Response uploadArquivo(@PathParam("id") Long id, @MultipartForm MaterialFileForm form) {
        try {
            materialFileService.salvar(id, form.getNomeArquivo(), form.getArquivo());
            return Response.noContent().build();
        } catch (IOException e) {
            return Response.status(Status.BAD_REQUEST)
                    .entity("Erro ao fazer upload: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/download/{nomeArquivo}")
    @RolesAllowed({"Professor", "Aluno"})
    public Response downloadArquivo(@PathParam("nomeArquivo") String nomeArquivo) {
        File arquivo = materialFileService.download(nomeArquivo);
        if (arquivo == null || !arquivo.exists()) {
            return Response.status(Status.NOT_FOUND).build();
        }
        ResponseBuilder response = Response.ok(arquivo);
        response.header("Content-Disposition", "attachment; filename=" + nomeArquivo);
        return response.build();
    }

    @GET
    @Path("/view/{nomeArquivo}")
    @RolesAllowed({"Professor", "Aluno"})
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response viewArquivo(@PathParam("nomeArquivo") String nomeArquivo) {
        File arquivo = materialFileService.download(nomeArquivo);
        if (arquivo == null || !arquivo.exists()) {
            return Response.status(Status.NOT_FOUND).build();
        }
        String contentType = "application/octet-stream";
        if (nomeArquivo.toLowerCase().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (nomeArquivo.toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        } else if (nomeArquivo.toLowerCase().endsWith(".jpg") || nomeArquivo.toLowerCase().endsWith(".jpeg")) {
            contentType = "image/jpeg";
        }
        ResponseBuilder response = Response.ok(arquivo);
        response.header("Content-Type", contentType);
        response.header("Content-Disposition", "inline; filename=" + nomeArquivo);
        return response.build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"Aluno"})
    public Response getMeusMateriais() {
        String username = jwt.getSubject();
        var aluno = alunoService.findByUsername(username);
        var todosMateriais = new ArrayList<MaterialExtraAulaResponseDTO>();
        if (aluno.turmas() != null && !aluno.turmas().isEmpty()) {
            for (var turma : aluno.turmas()) {
                todosMateriais.addAll(materialService.findByTurmaId(turma.id()));
            }
        }
        return Response.ok(todosMateriais).build();
    }
}
