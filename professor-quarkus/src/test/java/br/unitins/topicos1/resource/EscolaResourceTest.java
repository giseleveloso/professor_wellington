package br.unitins.topicos1.resource;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
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
public class EscolaResourceTest {

    private static Long escolaId;

    @Test
    @Order(1)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateEscola() {
        escolaId = given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Escola Teste\",\"descricao\":\"Descricao teste\"}")
            .when()
            .post("/escolas")
            .then()
            .statusCode(201)
            .body("nome", is("Escola Teste"))
            .body("descricao", is("Descricao teste"))
            .body("ativo", is(true))
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
            .get("/escolas/" + escolaId)
            .then()
            .statusCode(200)
            .body("nome", is("Escola Teste"))
            .body("id", is(escolaId.intValue()));
    }

    @Test
    @Order(3)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAll() {
        given()
            .when()
            .get("/escolas")
            .then()
            .statusCode(200)
            .body("size()", is(1));
    }

    @Test
    @Order(4)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAllAtivas() {
        given()
            .when()
            .get("/escolas/ativas")
            .then()
            .statusCode(200)
            .body("size()", is(1));
    }

    @Test
    @Order(5)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testUpdateEscola() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Escola Atualizada\",\"descricao\":\"Nova descricao\"}")
            .when()
            .put("/escolas/" + escolaId)
            .then()
            .statusCode(200)
            .body("nome", is("Escola Atualizada"))
            .body("descricao", is("Nova descricao"));
    }

    @Test
    @Order(6)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testDesativarEscola() {
        given()
            .contentType(ContentType.JSON)
            .when()
            .put("/escolas/" + escolaId + "/desativar")
            .then()
            .statusCode(204);
    }

    @Test
    @Order(7)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testAtivarEscola() {
        given()
            .contentType(ContentType.JSON)
            .when()
            .put("/escolas/" + escolaId + "/ativar")
            .then()
            .statusCode(204);
    }

    @Test
    @Order(8)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateDuplicateName() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Escola Atualizada\",\"descricao\":\"Outra\"}")
            .when()
            .post("/escolas")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(9)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testDeleteEscola() {
        given()
            .when()
            .delete("/escolas/" + escolaId)
            .then()
            .statusCode(204);
    }

    @Test
    @Order(10)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindAllAfterDelete() {
        given()
            .when()
            .get("/escolas")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @Order(11)
    public void testCreateUnauthorized() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Escola\",\"descricao\":\"Desc\"}")
            .when()
            .post("/escolas")
            .then()
            .statusCode(401);
    }

    @Test
    @Order(12)
    @TestSecurity(user = "testaluno", roles = "Aluno")
    public void testCreateForbiddenForAluno() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"Escola\",\"descricao\":\"Desc\"}")
            .when()
            .post("/escolas")
            .then()
            .statusCode(403);
    }

    /*
    @Test
    @Order(13)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testCreateValidationBlankNome() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"nome\":\"\",\"descricao\":\"Desc\"}")
            .when()
            .post("/escolas")
            .then()
            .statusCode(400);
    }
 */
    @Test
    @Order(14)
    @TestSecurity(user = "testprof", roles = "Professor")
    public void testFindByIdNotFound() {
        given()
            .when()
            .get("/escolas/99999")
            .then()
            .statusCode(400);
    }
}
