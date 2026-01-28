export interface User {
  username: string;
  nome: string;
  perfil: number;
  token?: string;
}

export interface AuthRequest {
  username: string;
  senha: string;
  perfil: number;
}

export interface Escola {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

export type ModoTenant = 'INDIVIDUAL' | 'ESCOLA';

export interface Professor {
  id: number;
  nome: string;
  email: string;
  username: string;
  telefone?: Telefone;
  escola?: Escola;
  modoTenant: ModoTenant;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  username: string;
  telefone?: Telefone;
  telefoneResponsavel?: Telefone;
  dataNascimento?: string;
  idTurma: number;
  nomeTurma: string;
  turmas?: TurmaSimples[];
  observacoes?: string;
}

export interface TurmaSimples {
  id: number;
  nome: string;
}

export interface Telefone {
  id?: number;
  codigoArea: string;
  numero: string;
}

export interface Turma {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  idioma: EnumValue;
  nivelTurma: NivelTurmaSimples | null;
  horario: string;
  diasSemana: string;
  horariosPorDia?: HorarioDia[];
  idProfessor: number;
  nomeProfessor: string;
  quantidadeAlunos: number;
}

export interface NivelTurmaSimples {
  id: number;
  codigo: string;
  descricao: string;
}

export interface HorarioDia {
  diaSemana: number;
  diaNome: string;
  horaInicio: string;
  horaFim: string;
}

export interface Aula {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  topico: string;
  descricao: string;
  duracaoMinutos: number;
  idTurma: number;
  nomeTurma: string;
}

// Status de presença do aluno na aula
export type StatusPresenca = 'presente' | 'falta' | 'cancelada';
export type StatusDeverCasa = 'feito' | 'nao_feito' | 'nao_aplica';
export type StatusPreparacaoAula = 'feito' | 'nao_feito' | 'nao_aplica';

export interface Presenca {
  id: number;
  presente: boolean;
  status: StatusPresenca;
  deverCasa: StatusDeverCasa;
  preparacaoAula: StatusPreparacaoAula;
  comentario: string;
  observacao: string;
  idAula: number;
  dataAula: string;
  topicoAula: string;
  idAluno: number;
  nomeAluno: string;
}

export interface PresencaRegistro {
  idAluno: number;
  idAula: number;
  presente: boolean;
  status: StatusPresenca;
  deverCasa: StatusDeverCasa;
  preparacaoAula: StatusPreparacaoAula;
  comentario: string;
}

export interface Desempenho {
  id: number;
  nota: number;
  comentario: string;
  privado: boolean;
  idAula: number;
  dataAula: string;
  topicoAula: string;
  idAluno: number;
  nomeAluno: string;
}

export interface Pagamento {
  id: number;
  mesReferencia: string;
  anoReferencia: number;
  valor: number;
  dataVencimento: string;
  dataPagamento: string;
  status: EnumValue;
  observacao: string;
  idAluno: number;
  nomeAluno: string;
}

export interface CategoriaVideo {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
}

export interface SubcategoriaVideo {
  id: number;
  nome: string;
  descricao: string;
  categoriaRaiz: CategoriaVideo;
  idSubcategoriaPai: number | null;
  nomeSubcategoriaPai: string | null;
  nivel: number;
  subcategoriasFilhas: SubcategoriaVideoSimple[] | null;
}

export interface SubcategoriaVideoSimple {
  id: number;
  nome: string;
  descricao: string;
  nivel: number;
}

export interface Video {
  id: number;
  titulo: string;
  linkYoutube: string;
  descricao: string;
  categoria: CategoriaVideo | null;
  subcategoria: SubcategoriaVideoSimple | null;
  idTurma: number;
  nomeTurma: string;
}

export interface MaterialExtraAula {
  id: number;
  titulo: string;
  tipoConteudo: EnumValue;
  descricao: string;
  urlArquivo: string;
  nomeArquivo: string;
  dataPublicacao: string;
  idTurma: number;
  nomeTurma: string;
  categoria: CategoriaVideo | null;
  subcategoria: SubcategoriaVideoSimple | null;
}

export interface EnumValue {
  id: number;
  label: string;
}

// Nível de turma personalizável
export interface NivelTurma {
  id: number;
  codigo: string;
  descricao: string;
  ordem: number;
}

// Estatísticas do Dashboard
export interface DashboardStats {
  totalTurmas: number;
  totalAlunos: number;
  aulasHoje: number;
  pagamentosPendentes: number;
  receitaMensal: number;
}
