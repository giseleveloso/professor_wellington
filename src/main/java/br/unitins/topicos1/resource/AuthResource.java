package br.unitins.topicos1.resource;

import br.unitins.topicos1.dto.AuthUsuarioDTO;
import br.unitins.topicos1.dto.UsuarioResponseDTO;
import br.unitins.topicos1.service.AlunoService;
import br.unitins.topicos1.service.HashService;
import br.unitins.topicos1.service.JwtService;
import br.unitins.topicos1.service.ProfessorService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Path("/auth")
public class AuthResource {

    @Inject
    public ProfessorService professorService;

    @Inject
    public AlunoService alunoService;

    @Inject
    public HashService hashService;

    @Inject
    public JwtService jwtService;

    @POST
    public Response login(AuthUsuarioDTO dto) {
        String hash = hashService.getHashSenha(dto.senha());

        UsuarioResponseDTO usuario = null;
        // perfil 1 = Professor
        if (dto.perfil() == 1) {
            usuario = professorService.login(dto.username(), hash);
        } else if (dto.perfil() == 2) { // Aluno
            usuario = alunoService.login(dto.username(), hash);
        } else {
            return Response.status(Status.NOT_FOUND)
                    .header("ERRO", "Perfil inválido")
                    .build();
        }

        if (usuario != null) {
            return Response.ok(usuario)
                    .header("Authorization", jwtService.generateJwt(dto, usuario))
                    .build();
        } else {
            return Response.status(Status.NOT_FOUND)
                    .header("ERRO", "Usuário ou senha incorretos")
                    .build();
        }
    }
}
