-- =====================================================
-- DADOS INICIAIS - SISTEMA PROFESSOR WELLINGTON
-- =====================================================

-- Inserir Usuário do Professor
-- Senha: 123456 (hash gerado com PBKDF2WithHmacSHA512)
INSERT INTO usuario (id, username, senha, datacadastro) VALUES 
(1, 'professor.wellington', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW());

-- Inserir Telefone do Professor
INSERT INTO telefone (id, codigoarea, numero, datacadastro) VALUES 
(1, '63', '999999999', NOW());

-- Inserir Professor (modo INDIVIDUAL por padrão, sem escola)
INSERT INTO professor (id, nome, email, id_telefone, id_usuario, modotenant, datacadastro) VALUES
(1, 'Professor Wellington', 'wellington@email.com', 1, 1, 'INDIVIDUAL', NOW());

-- Inserir Níveis de Turma (personalizáveis por professor)
INSERT INTO nivelturma (id, codigo, descricao, ordem, id_professor, datacadastro) VALUES 
(1, 'A0', 'Iniciante Absoluto', 1, 1, NOW()),
(2, 'A1', 'Iniciante', 2, 1, NOW()),
(3, 'A2', 'Básico', 3, 1, NOW()),
(4, 'B1', 'Intermediário', 4, 1, NOW()),
(5, 'B2', 'Intermediário Superior', 5, 1, NOW()),
(6, 'C1', 'Avançado', 6, 1, NOW()),
(7, 'C2', 'Fluente', 7, 1, NOW());

-- Inserir Turmas
INSERT INTO turma (id, nome, descricao, cor, idioma, id_nivel_turma, horario, diassemana, id_professor, datacadastro) VALUES 
(1, 'Inglês Básico - Manhã', 'Kids - Presencial - Grupo', '#3B82F6', 1, 3, '08:00 - 10:00', 'Segunda, Quarta, Sexta', 1, NOW()),
(2, 'Inglês Intermediário - Tarde', 'Teens - Online', '#22C55E', 1, 4, '14:00 - 16:00', 'Terça, Quinta', 1, NOW()),
(3, 'Espanhol Iniciante', 'Adultos - Presencial', '#EC4899', 2, 2, '19:00 - 21:00', 'Segunda, Quarta', 1, NOW());

-- Inserir Usuários dos Alunos
INSERT INTO usuario (id, username, senha, datacadastro) VALUES 
(2, 'maria.silva', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW()),
(3, 'joao.santos', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW()),
(4, 'ana.costa', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW());

-- Inserir Telefones dos Alunos
INSERT INTO telefone (id, codigoarea, numero, datacadastro) VALUES 
(2, '63', '988888888', NOW()),
(3, '63', '977777777', NOW()),
(4, '63', '966666666', NOW());

-- Inserir Alunos
INSERT INTO aluno (id, nome, email, id_telefone, id_usuario, id_turma, datanascimento, datacadastro) VALUES 
(1, 'Maria Silva', 'maria.silva@email.com', 2, 2, 1, '2010-03-15', NOW()),
(2, 'João Santos', 'joao.santos@email.com', 3, 3, 1, '2008-07-22', NOW()),
(3, 'Ana Costa', 'ana.costa@email.com', 4, 4, 2, '2012-01-10', NOW());

-- Inserir Aulas
INSERT INTO aula (id, data, horainicio, horafim, topico, descricao, duracaominutos, id_turma, datacadastro) VALUES 
(1, '2026-01-13', '08:00:00', '10:00:00', 'Introduction and Greetings', 'Primeiras palavras e saudações em inglês', 120, 1, NOW()),
(2, '2026-01-15', '08:00:00', '10:00:00', 'Numbers and Colors', 'Números de 1 a 100 e cores básicas', 120, 1, NOW()),
(3, '2026-01-14', '14:00:00', '16:00:00', 'Past Tense Review', 'Revisão do passado simples', 120, 2, NOW());

-- Inserir Categorias de Vídeo (associadas ao professor)
INSERT INTO categoriavideo (id, nome, descricao, cor, id_professor, datacadastro) VALUES
(1, 'Gramática', 'Aulas sobre estrutura e regras gramaticais', '#3B82F6', 1, NOW()),
(2, 'Vocabulário', 'Palavras e expressões do dia a dia', '#22C55E', 1, NOW()),
(3, 'Histórias', 'Narrativas e contos para prática', '#EC4899', 1, NOW()),
(4, 'Conversação', 'Diálogos e prática de conversação', '#F59E0B', 1, NOW()),
(5, 'Pronúncia', 'Exercícios de pronúncia e fonética', '#8B5CF6', 1, NOW()),
(6, 'Cultura', 'Aspectos culturais e curiosidades', '#EF4444', 1, NOW());

-- Inserir Subcategorias de Vídeo (associadas ao professor)
INSERT INTO subcategoriavideo (id, nome, descricao, id_categoria_raiz, id_subcategoria_pai, nivel, id_professor, datacadastro) VALUES
(1, 'Kids', 'Conteúdo para crianças', 1, NULL, 0, 1, NOW()),
(2, 'Teens', 'Conteúdo para adolescentes', 1, NULL, 0, 1, NOW()),
(3, 'Adults', 'Conteúdo para adultos', 1, NULL, 0, 1, NOW()),
(4, 'Kids', 'Conteúdo para crianças', 2, NULL, 0, 1, NOW()),
(5, 'Teens', 'Conteúdo para adolescentes', 2, NULL, 0, 1, NOW());

-- Inserir Vídeos de Exemplo
INSERT INTO video (id, titulo, linkyoutube, descricao, id_categoria, id_subcategoria, id_turma, datacadastro) VALUES
(1, 'English Greetings for Beginners', 'https://www.youtube.com/watch?v=example1', 'Aprenda as saudações básicas em inglês', 2, 4, 1, NOW()),
(2, 'English Grammar - Present Tense', 'https://www.youtube.com/watch?v=example2', 'Gramática: Presente simples', 1, 1, 1, NOW()),
(3, 'English Vocabulary - Family Members', 'https://www.youtube.com/watch?v=example3', 'Vocabulário: Membros da família', 2, 4, 1, NOW()),
(4, 'English Story - The Little Prince', 'https://www.youtube.com/watch?v=example4', 'História: O Pequeno Príncipe', 3, NULL, 1, NOW());

-- Inserir Materiais Extra Aula
INSERT INTO materialextraaula (id, titulo, tipoconteudo, descricao, urlarquivo, datapublicacao, id_turma, datacadastro) VALUES 
(1, 'BBC News - World Section', 4, 'Notícias em inglês para prática de leitura', 'https://www.bbc.com/news/world', '2026-01-10', 1, NOW()),
(2, 'The Great Gatsby - PDF', 5, 'Livro clássico para leitura avançada', NULL, '2026-01-10', 2, NOW()),
(3, 'Daily Dialogues Podcast', 3, 'Podcast com diálogos do dia a dia', 'https://example.com/podcast', '2026-01-11', 1, NOW());

-- Inserir Pagamentos
INSERT INTO pagamento (id, mesreferencia, anoreferencia, valor, datavencimento, datapagamento, status, observacao, id_aluno, datacadastro) VALUES
(1, 'Janeiro', 2026, 350.00, '2026-01-15', '2026-01-10', 2, 'Pagamento antecipado', 1, NOW()),
(2, 'Janeiro', 2026, 350.00, '2026-01-15', NULL, 1, NULL, 2, NOW()),
(3, 'Janeiro', 2026, 450.00, '2026-01-15', NULL, 1, NULL, 3, NOW());

-- =====================================================
-- PROFESSOR 2 - PROFESSORA MARIA (para teste de separação)
-- =====================================================

-- Usuário da Professora Maria (senha: 123456)
INSERT INTO usuario (id, username, senha, datacadastro) VALUES
(5, 'professora.maria', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW());

-- Telefone da Professora Maria
INSERT INTO telefone (id, codigoarea, numero, datacadastro) VALUES
(5, '11', '912345678', NOW());

-- Professora Maria
INSERT INTO professor (id, nome, email, id_telefone, id_usuario, modotenant, datacadastro) VALUES
(2, 'Professora Maria', 'maria.professora@email.com', 5, 5, 'INDIVIDUAL', NOW());

-- Níveis de Turma da Professora Maria
INSERT INTO nivelturma (id, codigo, descricao, ordem, id_professor, datacadastro) VALUES
(8, 'N1', 'Nível 1 - Iniciante', 1, 2, NOW()),
(9, 'N2', 'Nível 2 - Básico', 2, 2, NOW()),
(10, 'N3', 'Nível 3 - Intermediário', 3, 2, NOW());

-- Turmas da Professora Maria
INSERT INTO turma (id, nome, descricao, cor, idioma, id_nivel_turma, horario, diassemana, id_professor, datacadastro) VALUES
(4, 'Francês Iniciante', 'Adultos - Online', '#9333EA', 3, 8, '18:00 - 19:30', 'Segunda, Quarta', 2, NOW()),
(5, 'Francês Intermediário', 'Adultos - Presencial', '#F97316', 3, 10, '19:00 - 21:00', 'Terça, Quinta', 2, NOW());

-- Usuários dos Alunos da Professora Maria
INSERT INTO usuario (id, username, senha, datacadastro) VALUES
(6, 'carlos.lima', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW()),
(7, 'fernanda.souza', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW());

-- Telefones dos Alunos da Professora Maria
INSERT INTO telefone (id, codigoarea, numero, datacadastro) VALUES
(6, '11', '955555555', NOW()),
(7, '11', '944444444', NOW());

-- Alunos da Professora Maria
INSERT INTO aluno (id, nome, email, id_telefone, id_usuario, id_turma, datanascimento, datacadastro) VALUES
(4, 'Carlos Lima', 'carlos.lima@email.com', 6, 6, 4, '1990-05-20', NOW()),
(5, 'Fernanda Souza', 'fernanda.souza@email.com', 7, 7, 5, '1985-11-30', NOW());

-- Aulas da Professora Maria
INSERT INTO aula (id, data, horainicio, horafim, topico, descricao, duracaominutos, id_turma, datacadastro) VALUES
(4, '2026-01-13', '18:00:00', '19:30:00', 'Bonjour! Saudações em Francês', 'Primeiras palavras e cumprimentos', 90, 4, NOW()),
(5, '2026-01-14', '19:00:00', '21:00:00', 'Verbos no Presente', 'Conjugação de verbos regulares', 120, 5, NOW());

-- Categorias de Vídeo da Professora Maria
INSERT INTO categoriavideo (id, nome, descricao, cor, id_professor, datacadastro) VALUES
(7, 'Gramática Francesa', 'Regras gramaticais do francês', '#9333EA', 2, NOW()),
(8, 'Cultura Francesa', 'Aspectos culturais da França', '#F97316', 2, NOW());

-- Subcategorias de Vídeo da Professora Maria
INSERT INTO subcategoriavideo (id, nome, descricao, id_categoria_raiz, id_subcategoria_pai, nivel, id_professor, datacadastro) VALUES
(6, 'Iniciantes', 'Conteúdo para iniciantes', 7, NULL, 0, 2, NOW()),
(7, 'Intermediários', 'Conteúdo intermediário', 7, NULL, 0, 2, NOW());

-- Vídeos da Professora Maria
INSERT INTO video (id, titulo, linkyoutube, descricao, id_categoria, id_subcategoria, id_turma, datacadastro) VALUES
(5, 'Bonjour - Saudações em Francês', 'https://www.youtube.com/watch?v=french1', 'Aprenda a cumprimentar em francês', 7, 6, 4, NOW()),
(6, 'Verbos Franceses - Presente', 'https://www.youtube.com/watch?v=french2', 'Conjugação de verbos no presente', 7, 7, 5, NOW());

-- Materiais da Professora Maria
INSERT INTO materialextraaula (id, titulo, tipoconteudo, descricao, urlarquivo, datapublicacao, id_turma, datacadastro) VALUES
(4, 'Le Monde - Notícias', 4, 'Jornal francês para prática de leitura', 'https://www.lemonde.fr', '2026-01-10', 4, NOW());

-- Pagamentos da Professora Maria
INSERT INTO pagamento (id, mesreferencia, anoreferencia, valor, datavencimento, datapagamento, status, observacao, id_aluno, datacadastro) VALUES
(4, 'Janeiro', 2026, 400.00, '2026-01-20', NULL, 1, NULL, 4, NOW()),
(5, 'Janeiro', 2026, 500.00, '2026-01-20', '2026-01-18', 2, 'Pago via PIX', 5, NOW());

-- Ajustar sequences
SELECT setval('usuario_id_seq', 20);
SELECT setval('telefone_id_seq', 20);
SELECT setval('professor_id_seq', 20);
SELECT setval('escola_id_seq', 1);
SELECT setval('nivelturma_id_seq', 20);
SELECT setval('turma_id_seq', 20);
SELECT setval('aluno_id_seq', 20);
SELECT setval('aula_id_seq', 20);
SELECT setval('categoriavideo_id_seq', 20);
SELECT setval('subcategoriavideo_id_seq', 20);
SELECT setval('video_id_seq', 20);
SELECT setval('materialextraaula_id_seq', 20);
SELECT setval('pagamento_id_seq', 20);


-- =====================================================
-- PROFESSOR 3 - WELLINGTON VELOSO
-- =====================================================

-- Usuário do Professor Wellington Veloso (senha: 123456)
INSERT INTO usuario (id, username, senha, datacadastro) VALUES
(8, 'wellington.veloso', '0cctg7WgpEz7kC/AzVC+KX+bZLPXDtgJDqWWZWnmzHH+7Na2YVxYYSFPxcf7ImAjqfNckx0aT4n5qKM7WEoeEQ==', NOW());

-- Telefone do Professor Wellington Veloso
INSERT INTO telefone (id, codigoarea, numero, datacadastro) VALUES
(8, '63', '984902422', NOW());

-- Professor Wellington Veloso
INSERT INTO professor (id, nome, email, id_telefone, id_usuario, modotenant, datacadastro) VALUES
(3, 'Wellington Veloso', 'wellingtonvelosocursos@gmail.com', 8, 8, 'INDIVIDUAL', NOW());
