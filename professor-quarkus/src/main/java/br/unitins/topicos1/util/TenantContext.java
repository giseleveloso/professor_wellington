package br.unitins.topicos1.util;

import org.eclipse.microprofile.jwt.JsonWebToken;

import br.unitins.topicos1.model.Aluno;
import br.unitins.topicos1.model.Escola;
import br.unitins.topicos1.model.ModoTenant;
import br.unitins.topicos1.model.Professor;
import br.unitins.topicos1.repository.AlunoRepository;
import br.unitins.topicos1.repository.ProfessorRepository;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

@RequestScoped
public class TenantContext {

    @Inject
    JsonWebToken jwt;

    @Inject
    ProfessorRepository professorRepository;

    @Inject
    AlunoRepository alunoRepository;

    private Professor cachedProfessor;
    private Aluno cachedAluno;
    private Boolean isAluno;

    public Professor getCurrentProfessor() {
        if (cachedProfessor == null) {
            String username = jwt.getSubject();
            if (username != null) {
                cachedProfessor = professorRepository.findByUsername(username);
            }
        }
        return cachedProfessor;
    }

    public boolean isSharedMode() {
        Professor p = getCurrentProfessor();
        return p != null
            && p.getModoTenant() == ModoTenant.ESCOLA
            && p.getEscola() != null;
    }

    public Long getFilterId() {
        Professor p = getCurrentProfessor();
        if (p == null) {
            return null;
        }
        if (isSharedMode()) {
            return p.getEscola().getId();
        }
        return p.getId();
    }

    public String getFilterField() {
        return isSharedMode() ? "escola.id" : "professor.id";
    }

    public Escola getCurrentEscola() {
        Professor p = getCurrentProfessor();
        return p != null ? p.getEscola() : null;
    }

    public ModoTenant getModoTenant() {
        Professor p = getCurrentProfessor();
        return p != null ? p.getModoTenant() : ModoTenant.INDIVIDUAL;
    }

    /**
     * Verifica se o usuário logado é um aluno
     */
    public boolean isAluno() {
        if (isAluno == null) {
            String username = jwt.getSubject();
            if (username != null) {
                // Primeiro verifica se é professor
                Professor professor = professorRepository.findByUsername(username);
                if (professor != null) {
                    isAluno = false;
                    cachedProfessor = professor;
                } else {
                    // Se não é professor, verifica se é aluno
                    Aluno aluno = alunoRepository.findByUsername(username);
                    isAluno = aluno != null;
                    cachedAluno = aluno;
                }
            } else {
                isAluno = false;
            }
        }
        return isAluno;
    }

    /**
     * Obtém o aluno atual (se o usuário logado for aluno)
     */
    public Aluno getCurrentAluno() {
        if (cachedAluno == null && isAluno()) {
            String username = jwt.getSubject();
            if (username != null) {
                cachedAluno = alunoRepository.findByUsername(username);
            }
        }
        return cachedAluno;
    }

    /**
     * Obtém o professor relevante para o contexto atual.
     * Se o usuário é um professor, retorna ele mesmo.
     * Se o usuário é um aluno, retorna o professor da turma do aluno.
     */
    public Professor getProfessorDoContexto() {
        // Se é professor, retorna o próprio professor
        Professor professor = getCurrentProfessor();
        if (professor != null) {
            return professor;
        }

        // Se é aluno, retorna o professor da turma
        Aluno aluno = getCurrentAluno();
        if (aluno != null && aluno.getTurma() != null) {
            return aluno.getTurma().getProfessor();
        }

        return null;
    }
}
