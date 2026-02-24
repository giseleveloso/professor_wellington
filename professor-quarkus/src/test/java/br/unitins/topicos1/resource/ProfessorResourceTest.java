package br.unitins.topicos1.resource;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class ProfessorResourceTest {

    private static Long professorId;

    @Test
    @Order(1)
    public void testCreateProfessor() {
        professorId = given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Prof Novo\",\"email\":\"profnovo@teste.com\",\"username\":\"profnovo\",\"senha\":\"123456\"}")
            .when()
            .post("/professores")
            .then()
            .statusCode(201)
            .body("nome", is("Prof Novo"))
            .body("email", is("profnovo@teste.com"))
            .body("username", is("profnovo"))
            .body("id", notNullValue())
            .extract()
            .jsonPath()
            .getLong("id");
    }

    @Test
    @Order(2)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindById() {
        given()
            .when()
            .get("/professores/" + professorId)
            .then()
            .statusCode(200)
            .body("nome", is("Prof Novo"))
            .body("id", is(professorId.intValue()));
    }

    @Test
    @Order(3)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAll() {
        given()
            .when()
            .get("/professores")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(2));
    }

    @Test
    @Order(4)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testUpdateProfessor() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Prof Atualizado\",\"email\":\"prof@atualizado.com\",\"username\":\"profnovo\",\"senha\":\"123456\"}")
            .when()
            .put("/professores/" + professorId)
            .then()
            .statusCode(200)
            .body("nome", is("Prof Atualizado"));
    }

    @Test
    @Order(5)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testUpdatePassword() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"novaSenha\":\"novaSenha123\"}")
            .when()
            .patch("/professores/" + professorId + "/senha")
            .then()
            .statusCode(204);
    }

    @Test
    @Order(6)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testUpdateUsername() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"novoUsername\":\"profatualizado\"}")
            .when()
            .patch("/professores/" + professorId + "/username")
            .then()
            .statusCode(204);
    }

    @Test
    @Order(7)
    public void testCreateDuplicateUsername() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Prof Dois\",\"email\":\"prof2@teste.com\",\"username\":\"testprof\",\"senha\":\"123456\"}")
            .when()
            .post("/professores")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(8)
    public void testFindAllUnauthorized() {
        given()
            .when()
            .get("/professores")
            .then()
            .statusCode(401);
    }

    @Test
    @Order(9)
    @TestSecurity(user = "testaluno", roles = "Aluno")
    public void testFindAllForbiddenForAluno() {
        given()
            .when()
            .get("/professores")
            .then()
            .statusCode(403);
    }
/*
    @Test
    @Order(10)
    public void testCreateValidationMissingFields() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"\",\"email\":\"\",\"username\":\"\",\"senha\":\"\"}")
            .when()
            .post("/professores")
            .then()
            .statusCode(400);
    }
 */
    @Test
    @Order(11)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByIdNotFound() {
        given()
            .when()
            .get("/professores/99999")
            .then()
            .statusCode(400);
    }
}
