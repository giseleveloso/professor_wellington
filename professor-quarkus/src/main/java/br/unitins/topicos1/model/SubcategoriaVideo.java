package br.unitins.topicos1.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class SubcategoriaVideo extends DefaultEntity {

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "id_categoria_raiz", nullable = false)
    private CategoriaVideo categoriaRaiz;

    // Referência à subcategoria pai (para criar hierarquia)
    @ManyToOne
    @JoinColumn(name = "id_subcategoria_pai")
    private SubcategoriaVideo subcategoriaPai;

    // Lista de subcategorias filhas
    @OneToMany(mappedBy = "subcategoriaPai")
    private List<SubcategoriaVideo> subcategoriasFilhas;

    // Nível na hierarquia (0 = raiz, 1 = primeiro nível, etc)
    @Column(nullable = false)
    private Integer nivel;

    @ManyToOne
    @JoinColumn(name = "id_professor")
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "id_escola")
    private Escola escola;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public CategoriaVideo getCategoriaRaiz() {
        return categoriaRaiz;
    }

    public void setCategoriaRaiz(CategoriaVideo categoriaRaiz) {
        this.categoriaRaiz = categoriaRaiz;
    }

    public SubcategoriaVideo getSubcategoriaPai() {
        return subcategoriaPai;
    }

    public void setSubcategoriaPai(SubcategoriaVideo subcategoriaPai) {
        this.subcategoriaPai = subcategoriaPai;
    }

    public List<SubcategoriaVideo> getSubcategoriasFilhas() {
        return subcategoriasFilhas;
    }

    public void setSubcategoriasFilhas(List<SubcategoriaVideo> subcategoriasFilhas) {
        this.subcategoriasFilhas = subcategoriasFilhas;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void setNivel(Integer nivel) {
        this.nivel = nivel;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public Escola getEscola() {
        return escola;
    }

    public void setEscola(Escola escola) {
        this.escola = escola;
    }
}
