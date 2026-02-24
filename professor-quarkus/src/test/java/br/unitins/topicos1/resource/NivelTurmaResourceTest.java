package br.unitins.topicos1.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.jwt.Claim;
import io.quarkus.test.security.jwt.JwtSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class NivelTurmaResourceTest {

    private static Long professorId;
    private static Long nivelId;

    @Test
    @Order(1)
    public void testSetupCreateProfessor() {
        professorId = given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Prof Nivel\",\"email\":\"profnivel@teste.com\",\"username\":\"nivelprof\",\"senha\":\"123456\"}")
            .when()
            .post("/professores")
            .then()
            .statusCode(201)
            .extract()
            .jsonPath()
            .getLong("id");
    }

    @Test
    @Order(2)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testFindByProfessorIdEmpty() {
        given()
            .when()
            .get("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @Order(3)
    public void testCreateUnauthorized() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"A1\",\"descricao\":\"Iniciante\"}")
            .when()
            .post("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(401);
    }

    @Test
    @Order(4)
    @TestSecurity(user = "nivelprof", roles = "Aluno")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testCreateForbiddenForAluno() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"A1\",\"descricao\":\"Iniciante\"}")
            .when()
            .post("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(403);
    }

    @Test
    @Order(5)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testCreateNivel() {
        nivelId = given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"A1\",\"descricao\":\"Iniciante\",\"ordem\":1}")
            .when()
            .post("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(201)
            .body("codigo", is("A1"))
            .body("descricao", is("Iniciante"))
            .body("id", notNullValue())
            .extract()
            .jsonPath()
            .getLong("id");
    }

    @Test
    @Order(6)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testFindById() {
        given()
            .when()
            .get("/niveis-turma/" + nivelId)
            .then()
            .statusCode(200)
            .body("codigo", is("A1"));
    }

    @Test
    @Order(7)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testFindByProfessorIdAfterCreate() {
        given()
            .when()
            .get("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(200)
            .body("size()", is(1));
    }

    @Test
    @Order(8)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testUpdateNivel() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"B1\",\"descricao\":\"Intermediario\",\"ordem\":1}")
            .when()
            .put("/niveis-turma/" + nivelId)
            .then()
            .statusCode(200)
            .body("codigo", is("B1"))
            .body("descricao", is("Intermediario"));
    }

    @Test
    @Order(9)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testCreateValidationBlankCodigo() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"\",\"descricao\":\"Iniciante\"}")
            .when()
            .post("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(400);
    }

    @Test
    @Order(10)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testCreateValidationBlankDescricao() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"A1\",\"descricao\":\"\"}")
            .when()
            .post("/niveis-turma/professor/" + professorId)
            .then()
            .statusCode(400);
    }

    @Test
    @Order(11)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testFindByIdNotFound() {
        given()
            .when()
            .get("/niveis-turma/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(12)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testUpdateNotFound() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"codigo\":\"B1\",\"descricao\":\"Intermediario\"}")
            .when()
            .put("/niveis-turma/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(13)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testDeleteNivel() {
        given()
            .when()
            .delete("/niveis-turma/" + nivelId)
            .then()
            .statusCode(204);
    }

    @Test
    @Order(14)
    @TestSecurity(user = "nivelprof", roles = "Professor")
    @JwtSecurity(claims = {
        @Claim(key = "sub", value = "nivelprof")
    })
    public void testDeleteNotFound() {
        given()
            .when()
            .delete("/niveis-turma/99999")
            .then()
            .statusCode(400);
    }
}
