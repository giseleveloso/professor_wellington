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

export interface Professor {
  id: number;
  nome: string;
  email: string;
  username: string;
  telefone?: Telefone;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  username: string;
  telefone?: Telefone;
  idTurma: number;
  nomeTurma: string;
}

export interface Telefone {
  id?: number;
  codigoArea: string;
  numero: string;
}

export interface Turma {
  id: number;
  nome: string;
  idioma: EnumValue;
  nivel: EnumValue;
  horario: string;
  diasSemana: string;
  idProfessor: number;
  nomeProfessor: string;
  quantidadeAlunos: number;
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

export interface Presenca {
  id: number;
  presente: boolean;
  observacao: string;
  idAula: number;
  dataAula: string;
  topicoAula: string;
  idAluno: number;
  nomeAluno: string;
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

export interface Video {
  id: number;
  titulo: string;
  linkYoutube: string;
  descricao: string;
  categoria: EnumValue;
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
}

export interface EnumValue {
  id: number;
  label: string;
}

// Estatísticas do Dashboard
export interface DashboardStats {
  totalTurmas: number;
  totalAlunos: number;
  aulasHoje: number;
  pagamentosPendentes: number;
  receitaMensal: number;
}
