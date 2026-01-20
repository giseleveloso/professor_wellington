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

-- Inserir Professor
INSERT INTO professor (id, nome, email, id_telefone, id_usuario, datacadastro) VALUES 
(1, 'Professor Wellington', 'wellington@email.com', 1, 1, NOW());

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

-- Inserir Vídeos de Exemplo
INSERT INTO video (id, titulo, linkyoutube, descricao, categoria, id_turma, datacadastro) VALUES 
(1, 'English Greetings for Beginners', 'https://www.youtube.com/watch?v=example1', 'Aprenda as saudações básicas em inglês', 2, 1, NOW()),
(2, 'English Grammar - Present Tense', 'https://www.youtube.com/watch?v=example2', 'Gramática: Presente simples', 1, 1, NOW()),
(3, 'English Vocabulary - Family Members', 'https://www.youtube.com/watch?v=example3', 'Vocabulário: Membros da família', 2, 1, NOW()),
(4, 'English Story - The Little Prince', 'https://www.youtube.com/watch?v=example4', 'História: O Pequeno Príncipe', 3, 1, NOW());

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

-- Ajustar sequences
SELECT setval('usuario_id_seq', 10);
SELECT setval('telefone_id_seq', 10);
SELECT setval('professor_id_seq', 10);
SELECT setval('nivelturma_id_seq', 10);
SELECT setval('turma_id_seq', 10);
SELECT setval('aluno_id_seq', 10);
SELECT setval('aula_id_seq', 10);
SELECT setval('video_id_seq', 10);
SELECT setval('materialextraaula_id_seq', 10);
SELECT setval('pagamento_id_seq', 10);
