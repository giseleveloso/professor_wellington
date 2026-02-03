import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Professor, Aluno, Turma, Aula,
  Presenca, Desempenho, Pagamento,
  Video, MaterialExtraAula, NivelTurma,
  CategoriaVideo, SubcategoriaVideo, Escola
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== PROFESSORES ====================
  getProfessores(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.apiUrl}/professores`);
  }

  getProfessor(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.apiUrl}/professores/${id}`);
  }

  getCurrentProfessor(): Observable<Professor> {
    return this.http.get<Professor>(`${this.apiUrl}/professores/me`);
  }

  createProfessor(data: any): Observable<Professor> {
    return this.http.post<Professor>(`${this.apiUrl}/professores`, data);
  }

  updateProfessor(id: number, data: any): Observable<Professor> {
    return this.http.put<Professor>(`${this.apiUrl}/professores/${id}`, data);
  }

  deleteProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/professores/${id}`);
  }

  updateProfessorPassword(id: number, novaSenha: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/professores/${id}/senha`, { novaSenha });
  }

  updateProfessorUsername(id: number, novoUsername: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/professores/${id}/username`, { novoUsername });
  }

  // ==================== ALUNOS ====================
  getAlunos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos`);
  }

  getAluno(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.apiUrl}/alunos/${id}`);
  }

  getCurrentAluno(): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.apiUrl}/alunos/me`);
  }

  getAlunosByTurma(turmaId: number): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos/turma/${turmaId}`);
  }

  getAlunosByProfessor(professorId: number): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos/professor/${professorId}`);
  }

  createAluno(data: any): Observable<Aluno> {
    return this.http.post<Aluno>(`${this.apiUrl}/alunos`, data);
  }

  updateAluno(id: number, data: any): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.apiUrl}/alunos/${id}`, data);
  }

  deleteAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alunos/${id}`);
  }

  updateAlunoPassword(id: number, novaSenha: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alunos/${id}/senha`, { novaSenha });
  }

  updateAlunoUsername(id: number, novoUsername: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alunos/${id}/username`, { novoUsername });
  }

  // Métodos para aluno logado
  getMinhasPresencas(): Observable<Presenca[]> {
    return this.http.get<Presenca[]>(`${this.apiUrl}/presencas/me`);
  }

  getMeusDesempenhos(): Observable<Desempenho[]> {
    return this.http.get<Desempenho[]>(`${this.apiUrl}/desempenhos/me`);
  }

  getMeusPagamentos(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/pagamentos/me`);
  }

  getMinhasAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/me`);
  }

  getMinhasTurmas(): Observable<Turma[]> {
    return this.http.get<Turma[]>(`${this.apiUrl}/turmas/me`);
  }

  getMeusVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/me`);
  }

  getMeusMateriais(): Observable<MaterialExtraAula[]> {
    return this.http.get<MaterialExtraAula[]>(`${this.apiUrl}/materiais/me`);
  }

  // ==================== TURMAS ====================
  getTurmas(): Observable<Turma[]> {
    return this.http.get<Turma[]>(`${this.apiUrl}/turmas`);
  }

  getTurma(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.apiUrl}/turmas/${id}`);
  }

  getTurmasByProfessor(professorId: number): Observable<Turma[]> {
    return this.http.get<Turma[]>(`${this.apiUrl}/turmas/professor/${professorId}`);
  }

  createTurma(data: any): Observable<Turma> {
    return this.http.post<Turma>(`${this.apiUrl}/turmas`, data);
  }

  updateTurma(id: number, data: any): Observable<Turma> {
    return this.http.put<Turma>(`${this.apiUrl}/turmas/${id}`, data);
  }

  deleteTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/turmas/${id}`);
  }

  // ==================== AULAS ====================
  getAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas`);
  }

  getAula(id: number): Observable<Aula> {
    return this.http.get<Aula>(`${this.apiUrl}/aulas/${id}`);
  }

  getAulasByTurma(turmaId: number): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/turma/${turmaId}`);
  }

  getAulasByData(data: string): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/data?data=${data}`);
  }

  getAulasByProfessor(professorId: number): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/professor/${professorId}`);
  }

  getAulasByProfessorAndData(professorId: number, data: string): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/professor/${professorId}/data?data=${data}`);
  }

  getAulasByPeriodo(inicio: string, fim: string): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/aulas/periodo?inicio=${inicio}&fim=${fim}`);
  }

  createAula(data: any): Observable<Aula> {
    return this.http.post<Aula>(`${this.apiUrl}/aulas`, data);
  }

  updateAula(id: number, data: any): Observable<Aula> {
    return this.http.put<Aula>(`${this.apiUrl}/aulas/${id}`, data);
  }

  deleteAula(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/aulas/${id}`);
  }

  // ==================== PRESENÇAS ====================
  getPresencasByAula(aulaId: number): Observable<Presenca[]> {
    return this.http.get<Presenca[]>(`${this.apiUrl}/presencas/aula/${aulaId}`);
  }

  getPresencasByAluno(alunoId: number): Observable<Presenca[]> {
    return this.http.get<Presenca[]>(`${this.apiUrl}/presencas/aluno/${alunoId}`);
  }

  createPresenca(data: any): Observable<Presenca> {
    return this.http.post<Presenca>(`${this.apiUrl}/presencas`, data);
  }

  registrarPresencasEmLote(aulaId: number, presencas: any[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/presencas/lote/${aulaId}`, presencas);
  }

  getContagemPresencas(alunoId: number): Observable<{ presencas: number; faltas: number }> {
    return this.http.get<{ presencas: number; faltas: number }>(`${this.apiUrl}/presencas/aluno/${alunoId}/contagem`);
  }

  getContagemDeveres(alunoId: number): Observable<{ feitos: number; naoFeitos: number; total: number }> {
    return this.http.get<{ feitos: number; naoFeitos: number; total: number }>(`${this.apiUrl}/presencas/aluno/${alunoId}/deveres`);
  }

  // ==================== DESEMPENHO ====================
  getDesempenhosByAluno(alunoId: number): Observable<Desempenho[]> {
    return this.http.get<Desempenho[]>(`${this.apiUrl}/desempenhos/aluno/${alunoId}`);
  }

  getDesempenhosByAula(aulaId: number): Observable<Desempenho[]> {
    return this.http.get<Desempenho[]>(`${this.apiUrl}/desempenhos/aula/${aulaId}`);
  }

  createDesempenho(data: any): Observable<Desempenho> {
    return this.http.post<Desempenho>(`${this.apiUrl}/desempenhos`, data);
  }

  updateDesempenho(id: number, data: any): Observable<Desempenho> {
    return this.http.put<Desempenho>(`${this.apiUrl}/desempenhos/${id}`, data);
  }

  // ==================== PAGAMENTOS ====================
  getPagamentos(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/pagamentos`);
  }

  getPagamentosByAluno(alunoId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/pagamentos/aluno/${alunoId}`);
  }

  getPagamentosPendentes(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/pagamentos/vencidos`);
  }

  getPagamentosByProfessor(professorId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/pagamentos/professor/${professorId}`);
  }

  createPagamento(data: any): Observable<Pagamento> {
    return this.http.post<Pagamento>(`${this.apiUrl}/pagamentos`, data);
  }

  marcarComoPago(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/pagamentos/${id}/pagar`, {});
  }

  marcarComoNaoPago(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/pagamentos/${id}/desfazer`, {});
  }

  deletePagamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pagamentos/${id}`);
  }

  // ==================== CATEGORIAS DE VÍDEO ====================
  getCategorias(): Observable<CategoriaVideo[]> {
    return this.http.get<CategoriaVideo[]>(`${this.apiUrl}/categorias-video`);
  }

  getCategoria(id: number): Observable<CategoriaVideo> {
    return this.http.get<CategoriaVideo>(`${this.apiUrl}/categorias-video/${id}`);
  }

  createCategoria(data: any): Observable<CategoriaVideo> {
    return this.http.post<CategoriaVideo>(`${this.apiUrl}/categorias-video`, data);
  }

  updateCategoria(id: number, data: any): Observable<CategoriaVideo> {
    return this.http.put<CategoriaVideo>(`${this.apiUrl}/categorias-video/${id}`, data);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categorias-video/${id}`);
  }

  searchCategorias(nome: string): Observable<CategoriaVideo[]> {
    return this.http.get<CategoriaVideo[]>(`${this.apiUrl}/categorias-video/search?nome=${nome}`);
  }

  // ==================== SUBCATEGORIAS DE VÍDEO ====================
  getSubcategorias(): Observable<SubcategoriaVideo[]> {
    return this.http.get<SubcategoriaVideo[]>(`${this.apiUrl}/subcategorias-video`);
  }

  getSubcategoria(id: number): Observable<SubcategoriaVideo> {
    return this.http.get<SubcategoriaVideo>(`${this.apiUrl}/subcategorias-video/${id}`);
  }

  getSubcategoriasByCategoria(categoriaId: number): Observable<SubcategoriaVideo[]> {
    return this.http.get<SubcategoriaVideo[]>(`${this.apiUrl}/subcategorias-video/categoria/${categoriaId}`);
  }

  getSubcategoriasByPai(paiId: number): Observable<SubcategoriaVideo[]> {
    return this.http.get<SubcategoriaVideo[]>(`${this.apiUrl}/subcategorias-video/pai/${paiId}`);
  }

  getSubcategoriasRaizes(categoriaId: number): Observable<SubcategoriaVideo[]> {
    return this.http.get<SubcategoriaVideo[]>(`${this.apiUrl}/subcategorias-video/raizes?idCategoria=${categoriaId}`);
  }

  createSubcategoria(data: any): Observable<SubcategoriaVideo> {
    return this.http.post<SubcategoriaVideo>(`${this.apiUrl}/subcategorias-video`, data);
  }

  updateSubcategoria(id: number, data: any): Observable<SubcategoriaVideo> {
    return this.http.put<SubcategoriaVideo>(`${this.apiUrl}/subcategorias-video/${id}`, data);
  }

  deleteSubcategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategorias-video/${id}`);
  }

  searchSubcategorias(nome: string): Observable<SubcategoriaVideo[]> {
    return this.http.get<SubcategoriaVideo[]>(`${this.apiUrl}/subcategorias-video/search?nome=${nome}`);
  }

  // ==================== VÍDEOS ====================
  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos`);
  }

  getVideosByTurma(turmaId: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/turma/${turmaId}`);
  }

  getVideosByCategoria(turmaId: number, categoriaId: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/turma/${turmaId}/categoria?idCategoria=${categoriaId}`);
  }

  getVideosBySubcategoria(turmaId: number, subcategoriaId: number): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/turma/${turmaId}/subcategoria/${subcategoriaId}`);
  }

  createVideo(data: any): Observable<Video> {
    return this.http.post<Video>(`${this.apiUrl}/videos`, data);
  }

  updateVideo(id: number, data: any): Observable<Video> {
    return this.http.put<Video>(`${this.apiUrl}/videos/${id}`, data);
  }

  deleteVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/videos/${id}`);
  }

  // ==================== MATERIAIS ====================
  getMateriais(): Observable<MaterialExtraAula[]> {
    return this.http.get<MaterialExtraAula[]>(`${this.apiUrl}/materiais`);
  }

  getMateriaisByTurma(turmaId: number): Observable<MaterialExtraAula[]> {
    return this.http.get<MaterialExtraAula[]>(`${this.apiUrl}/materiais/turma/${turmaId}`);
  }

  createMaterial(data: any): Observable<MaterialExtraAula> {
    return this.http.post<MaterialExtraAula>(`${this.apiUrl}/materiais`, data);
  }

  updateMaterial(id: number, data: any): Observable<MaterialExtraAula> {
    return this.http.put<MaterialExtraAula>(`${this.apiUrl}/materiais/${id}`, data);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/materiais/${id}`);
  }

  uploadMaterialFile(id: number, formData: FormData): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/materiais/${id}/upload`, formData);
  }

  getMateriaisByCategoria(categoriaId: number): Observable<MaterialExtraAula[]> {
    return this.http.get<MaterialExtraAula[]>(`${this.apiUrl}/materiais/categoria?idCategoria=${categoriaId}`);
  }

  getMateriaisBySubcategoria(subcategoriaId: number): Observable<MaterialExtraAula[]> {
    return this.http.get<MaterialExtraAula[]>(`${this.apiUrl}/materiais/subcategoria/${subcategoriaId}`);
  }

  // ==================== NÍVEIS DE TURMA ====================
  getNiveisTurma(professorId: number): Observable<NivelTurma[]> {
    return this.http.get<NivelTurma[]>(`${this.apiUrl}/niveis-turma/professor/${professorId}`);
  }

  getNivelTurma(id: number): Observable<NivelTurma> {
    return this.http.get<NivelTurma>(`${this.apiUrl}/niveis-turma/${id}`);
  }

  createNivelTurma(professorId: number, data: any): Observable<NivelTurma> {
    return this.http.post<NivelTurma>(`${this.apiUrl}/niveis-turma/professor/${professorId}`, data);
  }

  updateNivelTurma(id: number, data: any): Observable<NivelTurma> {
    return this.http.put<NivelTurma>(`${this.apiUrl}/niveis-turma/${id}`, data);
  }

  deleteNivelTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/niveis-turma/${id}`);
  }

  criarNiveisTurmaPadrao(professorId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/niveis-turma/professor/${professorId}/padrao`, {});
  }

  reordenarNiveisTurma(professorId: number, ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/niveis-turma/professor/${professorId}/reordenar`, ids);
  }

  // ==================== ESCOLAS ====================
  getEscolas(): Observable<Escola[]> {
    return this.http.get<Escola[]>(`${this.apiUrl}/escolas`);
  }

  getEscolasAtivas(): Observable<Escola[]> {
    return this.http.get<Escola[]>(`${this.apiUrl}/escolas/ativas`);
  }

  getEscola(id: number): Observable<Escola> {
    return this.http.get<Escola>(`${this.apiUrl}/escolas/${id}`);
  }

  createEscola(data: any): Observable<Escola> {
    return this.http.post<Escola>(`${this.apiUrl}/escolas`, data);
  }

  updateEscola(id: number, data: any): Observable<Escola> {
    return this.http.put<Escola>(`${this.apiUrl}/escolas/${id}`, data);
  }

  deleteEscola(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/escolas/${id}`);
  }

  ativarEscola(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/escolas/${id}/ativar`, {});
  }

  desativarEscola(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/escolas/${id}/desativar`, {});
  }

  adicionarProfessorEscola(escolaId: number, professorId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/escolas/${escolaId}/professores/${professorId}`, {});
  }

  removerProfessorEscola(professorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/escolas/professores/${professorId}`);
  }
}
