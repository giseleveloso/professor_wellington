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
      imports: [HttpClientTestingModule]
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

  it('should call GET /professores', () => {
    service.getProfessores().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/professores`);
    expect(req.request.method).toBe('GET');
  });

  it('should call GET /professores/:id', () => {
    service.getProfessor(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/professores/1`);
    expect(req.request.method).toBe('GET');
  });

  it('should call POST /professores', () => {
    const data = { nome: 'Test', email: 'test@test.com' };
    service.createProfessor(data).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/professores`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
  });

  it('should call GET /alunos', () => {
    service.getAlunos().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/alunos`);
    expect(req.request.method).toBe('GET');
  });

  it('should call GET /turmas', () => {
    service.getTurmas().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/turmas`);
    expect(req.request.method).toBe('GET');
  });
});
