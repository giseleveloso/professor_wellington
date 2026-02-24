-- Dados de teste para o professor "testprof"
INSERT INTO Usuario (id, username, senha, dataCadastro) VALUES (100, 'testprof', 'hashsenhateste', CURRENT_TIMESTAMP);
INSERT INTO Professor (id, nome, email, id_usuario, modoTenant, dataCadastro) VALUES (100, 'Professor Teste', 'testprof@test.com', 100, 'INDIVIDUAL', CURRENT_TIMESTAMP);

-- Resetar contadores de auto-increment para evitar conflito com IDs inseridos acima
ALTER TABLE Usuario ALTER COLUMN id RESTART WITH 200;
ALTER TABLE Professor ALTER COLUMN id RESTART WITH 200;
