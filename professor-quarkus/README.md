# ClassHub - Sistema de Gestão para Escola de Idiomas

Sistema web voltado para professores de idiomas que desejam gerenciar suas turmas, alunos, pagamentos e desempenho de forma prática e centralizada.

## 📋 Funcionalidades

### Módulo Professor
- **Cadastro de turmas e alunos** - Criar turmas com nome, idioma, horários e nível
- **Gerenciamento financeiro** - Registrar pagamentos mensais dos alunos
- **Calendário** - Visualizar eventos/aulas marcadas por dia e hora
- **Materiais de aula** - Cadastrar vídeos do YouTube com reprodutor embutido
- **Materiais extra-aula** - Cadastrar conteúdos complementares (notícias, livros, diálogos)
- **Desempenho e presenças** - Marcar presença/falta e registrar notas
- **Relatórios** - Gerar relatórios mensais com histórico

### Módulo Aluno
- **Painel pessoal** - Acompanhar status de pagamentos
- **Aulas e vídeos** - Reproduzir vídeos cadastrados pelo professor
- **Materiais extra-aula** - Acessar conteúdos adicionais
- **Desempenho** - Visualizar notas, presenças e comentários públicos

## 🛠️ Tecnologias

- **Backend**: Quarkus 3.7.2
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (SmallRye JWT)
- **ORM**: Hibernate Panache
- **Validação**: Hibernate Validator

## 🚀 Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.8+
- PostgreSQL 12+

### Configuração do Banco de Dados

1. Crie o banco de dados:
```sql
CREATE DATABASE professor_wellington;
CREATE USER topicos1 WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE professor_wellington TO topicos1;
```

### Gerando as chaves JWT

Execute no terminal (na pasta `src/main/resources/token`):
```bash
openssl genrsa -out rsaPrivateKey.pem 2048
openssl rsa -pubout -in rsaPrivateKey.pem -out publicKey.pem
openssl pkcs8 -topk8 -nocrypt -inform pem -in rsaPrivateKey.pem -outform pem -out privateKey.pem
```

### Executando o projeto

```bash
# Modo desenvolvimento
./mvnw quarkus:dev

# Compilar para produção
./mvnw package -Dquarkus.package.type=uber-jar
java -jar target/professor-wellington-1.0.0-SNAPSHOT-runner.jar
```

O backend estará disponível em: `http://localhost:8080`

## 📚 API Endpoints

### Autenticação
- `POST /auth` - Login (perfil: 1 = Professor, 2 = Aluno)

### Professores
- `POST /professores` - Cadastrar professor
- `GET /professores` - Listar todos
- `GET /professores/{id}` - Buscar por ID
- `PUT /professores/{id}` - Atualizar
- `DELETE /professores/{id}` - Remover

### Alunos
- `POST /alunos` - Cadastrar aluno
- `GET /alunos` - Listar todos
- `GET /alunos/turma/{turmaId}` - Listar por turma
- `GET /alunos/professor/{professorId}` - Listar por professor

### Turmas
- `POST /turmas` - Criar turma
- `GET /turmas` - Listar todas
- `GET /turmas/professor/{professorId}` - Listar por professor
- `GET /turmas/search/idioma?idIdioma=X` - Buscar por idioma
- `GET /turmas/search/nivel?idNivel=X` - Buscar por nível

### Aulas
- `POST /aulas` - Criar aula
- `GET /aulas/turma/{turmaId}` - Listar por turma
- `GET /aulas/data?data=YYYY-MM-DD` - Buscar por data
- `GET /aulas/professor/{professorId}` - Listar por professor

### Presenças
- `POST /presencas` - Registrar presença
- `POST /presencas/lote/{aulaId}` - Registrar em lote
- `GET /presencas/aluno/{alunoId}` - Histórico do aluno
- `GET /presencas/aluno/{alunoId}/contagem` - Contagem presenças/faltas

### Desempenho
- `POST /desempenhos` - Registrar desempenho
- `GET /desempenhos/aluno/{alunoId}` - Histórico completo (professor)
- `GET /desempenhos/meu/{alunoId}` - Histórico público (aluno)

### Pagamentos
- `POST /pagamentos` - Registrar pagamento
- `GET /pagamentos/aluno/{alunoId}` - Histórico do aluno
- `GET /pagamentos/vencidos` - Listar pendentes vencidos
- `PATCH /pagamentos/{id}/pagar` - Marcar como pago

### Vídeos
- `POST /videos` - Cadastrar vídeo
- `GET /videos/turma/{turmaId}` - Listar por turma
- `GET /videos/turma/{turmaId}/categoria?idCategoria=X` - Filtrar por categoria

### Materiais Extra Aula
- `POST /materiais` - Cadastrar material
- `GET /materiais/turma/{turmaId}` - Listar por turma
- `GET /materiais/turma/{turmaId}/tipo?idTipoConteudo=X` - Filtrar por tipo
- `PATCH /materiais/{id}/upload` - Upload de arquivo
- `GET /materiais/download/{nomeArquivo}` - Download de arquivo

## 📦 Enumerações

### Idiomas
1. Inglês, 2. Espanhol, 3. Francês, 4. Alemão, 5. Italiano, 6. Japonês, 7. Chinês, 8. Coreano, 9. Português, 10. Outro

### Níveis
1. Iniciante, 2. Básico, 3. Intermediário, 4. Avançado, 5. Fluente

### Categoria de Vídeo
1. Gramática, 2. Vocabulário, 3. Histórias, 4. Conversação, 5. Pronúncia, 6. Cultura, 7. Outro

### Tipo de Conteúdo
1. Leitura, 2. Vídeo, 3. Áudio, 4. Link, 5. PDF

### Status de Pagamento
1. Pendente, 2. Pago, 3. Atrasado, 4. Cancelado

## 👤 Usuários de Teste

| Usuário | Senha | Perfil |
|---------|-------|--------|
| professor.wellington | 123456 | Professor (1) |
| maria.silva | 123456 | Aluno (2) |
| joao.santos | 123456 | Aluno (2) |
| ana.costa | 123456 | Aluno (2) |

## 📁 Estrutura do Projeto

```
src/main/java/br/unitins/topicos1/
├── dto/           # Data Transfer Objects
├── form/          # Formulários multipart
├── model/         # Entidades JPA
│   └── converterjpa/  # Conversores de enum
├── repository/    # Repositórios Panache
├── resource/      # Endpoints REST
├── service/       # Lógica de negócio
├── util/          # Utilitários
└── validation/    # Validações customizadas
```

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.
