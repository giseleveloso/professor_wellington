package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.MaterialAluno;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MaterialAlunoRepository implements PanacheRepository<MaterialAluno> {

    public List<MaterialAluno> findByAlunoId(Long alunoId) {
        return find("aluno.id", alunoId).list();
    }

    public List<MaterialAluno> findByMaterialId(Long materialId) {
        return find("material.id", materialId).list();
    }

    public MaterialAluno findByAlunoIdAndMaterialId(Long alunoId, Long materialId) {
        return find("aluno.id = ?1 AND material.id = ?2", alunoId, materialId).firstResult();
    }

    public List<MaterialAluno> findFavoritosByAlunoId(Long alunoId) {
        return find("aluno.id = ?1 AND favorito = true", alunoId).list();
    }

    public List<MaterialAluno> findVistosByAlunoId(Long alunoId) {
        return find("aluno.id = ?1 AND visto = true", alunoId).list();
    }
}
