package br.unitins.topicos1.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class TurmaResourceTest {

    @Test
    @Order(1)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAllEmpty() {
        given()
            .when()
            .get("/turmas")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @Order(2)
    public void testFindAllUnauthorized() {
        given()
            .when()
            .get("/turmas")
            .then()
            .statusCode(401);
    }
/*
    @Test
    @Order(3)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateValidationMissingNome() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"descricao\":\"Descricao\",\"idIdioma\":1,\"idProfessor\":1}")
            .when()
            .post("/turmas")
            .then()
            .statusCode(400);
    }
 */
    @Test
    @Order(4)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByIdNotFound() {
        given()
            .when()
            .get("/turmas/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(5)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testDeleteNotFound() {
        given()
            .when()
            .delete("/turmas/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(6)
    @TestSecurity(user = "testaluno", roles = "Aluno")
    public void testCreateForbiddenForAluno() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Turma\",\"idIdioma\":1,\"idProfessor\":1}")
            .when()
            .post("/turmas")
            .then()
            .statusCode(403);
    }

    @Test
    @Order(7)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByProfessorId() {
        given()
            .when()
            .get("/turmas/professor/100")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }
}
