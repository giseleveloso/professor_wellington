import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // === PROFESSORES ===
  it('should get professores', () => {
    const mockData = [{ id: 1, nome: 'Prof 1' }];
    service.getProfessores().subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].nome).toBe('Prof 1');
    });
    const req = httpMock.expectOne(`${apiUrl}/professores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should get professor by id', () => {
    service.getProfessor(1).subscribe(data => {
      expect(data.nome).toBe('Prof 1');
    });
    const req = httpMock.expectOne(`${apiUrl}/professores/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, nome: 'Prof 1' });
  });

  it('should create professor', () => {
    const body = { nome: 'Novo', email: 'n@t.com', username: 'novo', senha: '123' };
    service.createProfessor(body).subscribe(data => {
      expect(data.nome).toBe('Novo');
    });
    const req = httpMock.expectOne(`${apiUrl}/professores`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, nome: 'Novo' });
  });

  it('should delete professor', () => {
    service.deleteProfessor(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/professores/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // === ALUNOS ===
  it('should get alunos', () => {
    service.getAlunos().subscribe(data => {
      expect(data.length).toBe(0);
    });
    const req = httpMock.expectOne(`${apiUrl}/alunos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get alunos by turma', () => {
    service.getAlunosByTurma(5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/alunos/turma/5`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create aluno', () => {
    const body = { nome: 'Aluno', email: 'a@t.com', username: 'aluno1', senha: '123' };
    service.createAluno(body).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/alunos`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  // === TURMAS ===
  it('should get turmas', () => {
    service.getTurmas().subscribe(data => {
      expect(data).toEqual([]);
    });
    const req = httpMock.expectOne(`${apiUrl}/turmas`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create turma', () => {
    const body = { nome: 'Turma A' };
    service.createTurma(body).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/turmas`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, nome: 'Turma A' });
  });

  it('should delete turma', () => {
    service.deleteTurma(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/turmas/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // === ESCOLAS ===
  it('should get escolas', () => {
    service.getEscolas().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/escolas`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create escola', () => {
    service.createEscola({ nome: 'Escola' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/escolas`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  it('should ativar escola', () => {
    service.ativarEscola(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/escolas/1/ativar`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should desativar escola', () => {
    service.desativarEscola(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/escolas/1/desativar`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // === NIVEIS TURMA ===
  it('should get niveis turma', () => {
    service.getNiveisTurma(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/niveis-turma/professor/1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create nivel turma', () => {
    service.createNivelTurma(1, { codigo: 'A1', descricao: 'Ini' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/niveis-turma/professor/1`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  // === AULAS ===
  it('should get aulas', () => {
    service.getAulas().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/aulas`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get aulas by turma', () => {
    service.getAulasByTurma(3).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/aulas/turma/3`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // === PAGAMENTOS ===
  it('should get pagamentos', () => {
    service.getPagamentos().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/pagamentos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should marcar como pago', () => {
    service.marcarComoPago(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/pagamentos/1/pagar`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  // === VIDEOS ===
  it('should get videos', () => {
    service.getVideos().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/videos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // === CATEGORIAS ===
  it('should get categorias', () => {
    service.getCategorias().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/categorias-video`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // === MATERIAIS ===
  it('should get materiais', () => {
    service.getMateriais().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/materiais`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
