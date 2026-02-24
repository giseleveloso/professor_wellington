package br.unitins.topicos1.resource;

import static org.hamcrest.CoreMatchers.is;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class AlunoResourceTest {

    @Test
    @Order(1)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAllEmpty() {
        given()
            .when()
            .get("/alunos")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @Order(2)
    public void testFindAllUnauthorized() {
        given()
            .when()
            .get("/alunos")
            .then()
            .statusCode(401);
    }

    /*
    @Test
    @Order(3)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateValidationMissingFields() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"\",\"email\":\"\"}")
            .when()
            .post("/alunos")
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
            .get("/alunos/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(5)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testDeleteNotFound() {
        given()
            .when()
            .delete("/alunos/99999")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(6)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByTurmaIdEmpty() {
        given()
            .when()
            .get("/alunos/turma/999")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @Order(7)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByProfessorIdEmpty() {
        given()
            .when()
            .get("/alunos/professor/100")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }
/*
    @Test
    @Order(8)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateValidationInvalidEmail() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Aluno Teste\",\"email\":\"invalido\",\"username\":\"aluno1\",\"senha\":\"123456\"}")
            .when()
            .post("/alunos")
            .then()
            .statusCode(400);
    }
             */
}
