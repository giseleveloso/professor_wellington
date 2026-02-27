package br.unitins.topicos1.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
public class AuthResourceTest {

    @Test
    public void testLoginProfessorInvalidCredentials() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"inexistente\",\"senha\":\"senhaerrada\",\"perfil\":1}")
            .when()
            .post("/auth")
            .then()
            .statusCode(404);
    }

    @Test
    public void testLoginAlunoInvalidCredentials() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"alunoinexistente\",\"senha\":\"senhaerrada\",\"perfil\":2}")
            .when()
            .post("/auth")
            .then()
            .statusCode(404);
    }

    @Test
    public void testLoginInvalidPerfil() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"user\",\"senha\":\"123456\",\"perfil\":99}")
            .when()
            .post("/auth")
            .then()
            .statusCode(404);
    }

    @Test
    public void testLoginEndpointExists() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"testprof\",\"senha\":\"wrongpass\",\"perfil\":1}")
            .when()
            .post("/auth")
            .then()
            .statusCode(404);
    }
}
