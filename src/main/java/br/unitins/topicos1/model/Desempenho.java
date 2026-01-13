package br.unitins.topicos1.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Desempenho extends DefaultEntity {

    @Column(precision = 4, scale = 2)
    private BigDecimal nota;
    
    @Column(length = 1000)
    private String comentario;
    
    private Boolean privado;
    
    @ManyToOne
    @JoinColumn(name = "id_aula")
    private Aula aula;
    
    @ManyToOne
    @JoinColumn(name = "id_aluno")
    private Aluno aluno;

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public Boolean getPrivado() {
        return privado;
    }

    public void setPrivado(Boolean privado) {
        this.privado = privado;
    }

    public Aula getAula() {
        return aula;
    }

    public void setAula(Aula aula) {
        this.aula = aula;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}
