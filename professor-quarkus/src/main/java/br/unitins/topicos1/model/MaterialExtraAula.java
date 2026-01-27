package br.unitins.topicos1.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class MaterialExtraAula extends DefaultEntity {

    private String titulo;
    private TipoConteudo tipoConteudo;
    
    @Column(length = 1000)
    private String descricao;
    
    @Column(length = 500)
    private String urlArquivo;
    
    private String nomeArquivo;
    private LocalDate dataPublicacao;
    
    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private CategoriaVideo categoria;

    @ManyToOne
    @JoinColumn(name = "id_subcategoria")
    private SubcategoriaVideo subcategoria;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public TipoConteudo getTipoConteudo() {
        return tipoConteudo;
    }

    public void setTipoConteudo(TipoConteudo tipoConteudo) {
        this.tipoConteudo = tipoConteudo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getUrlArquivo() {
        return urlArquivo;
    }

    public void setUrlArquivo(String urlArquivo) {
        this.urlArquivo = urlArquivo;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public LocalDate getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(LocalDate dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }

    public CategoriaVideo getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaVideo categoria) {
        this.categoria = categoria;
    }

    public SubcategoriaVideo getSubcategoria() {
        return subcategoria;
    }

    public void setSubcategoria(SubcategoriaVideo subcategoria) {
        this.subcategoria = subcategoria;
    }
}
