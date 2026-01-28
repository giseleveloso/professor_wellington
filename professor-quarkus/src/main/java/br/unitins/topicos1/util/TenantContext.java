package br.unitins.topicos1.util;

import org.eclipse.microprofile.jwt.JsonWebToken;

import br.unitins.topicos1.model.Escola;
import br.unitins.topicos1.model.ModoTenant;
import br.unitins.topicos1.model.Professor;
import br.unitins.topicos1.repository.ProfessorRepository;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

@RequestScoped
public class TenantContext {

    @Inject
    JsonWebToken jwt;

    @Inject
    ProfessorRepository professorRepository;

    private Professor cachedProfessor;

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
}
