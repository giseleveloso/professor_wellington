package br.unitins.topicos1.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Video extends DefaultEntity {

    private String titulo;
    
    @Column(length = 500)
    private String linkYoutube;
    
    @Column(length = 1000)
    private String descricao;
    
    private CategoriaVideo categoria;
    
    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getLinkYoutube() {
        return linkYoutube;
    }

    public void setLinkYoutube(String linkYoutube) {
        this.linkYoutube = linkYoutube;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public CategoriaVideo getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaVideo categoria) {
        this.categoria = categoria;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }
}
