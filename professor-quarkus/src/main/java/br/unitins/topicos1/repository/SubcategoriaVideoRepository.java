package br.unitins.topicos1.repository;

import java.util.List;

import br.unitins.topicos1.model.CategoriaVideo;
import br.unitins.topicos1.model.SubcategoriaVideo;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SubcategoriaVideoRepository implements PanacheRepository<SubcategoriaVideo> {

    public List<SubcategoriaVideo> findByCategoriaRaiz(CategoriaVideo categoriaRaiz) {
        return find("categoriaRaiz", categoriaRaiz).list();
    }

    public List<SubcategoriaVideo> findBySubcategoriaPai(Long idSubcategoriaPai) {
        if (idSubcategoriaPai == null) {
            return find("subcategoriaPai IS NULL").list();
        }
        return find("subcategoriaPai.id", idSubcategoriaPai).list();
    }

    public List<SubcategoriaVideo> findByCategoriaRaizAndPai(CategoriaVideo categoriaRaiz, Long idSubcategoriaPai) {
        if (idSubcategoriaPai == null) {
            return find("categoriaRaiz = ?1 AND subcategoriaPai IS NULL", categoriaRaiz).list();
        }
        return find("categoriaRaiz = ?1 AND subcategoriaPai.id = ?2", categoriaRaiz, idSubcategoriaPai).list();
    }

    public List<SubcategoriaVideo> findByNomeContaining(String nome) {
        return find("LOWER(nome) LIKE LOWER(?1)", "%" + nome + "%").list();
    }

    public List<SubcategoriaVideo> findRaizes(CategoriaVideo categoriaRaiz) {
        return find("categoriaRaiz = ?1 AND subcategoriaPai IS NULL", categoriaRaiz).list();
    }
}
