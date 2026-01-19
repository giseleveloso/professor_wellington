package br.unitins.topicos1.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Presenca extends DefaultEntity {

    private Boolean presente;
    private StatusPresenca status;
    private StatusDeverCasa deverCasa;
    private StatusPreparacaoAula preparacaoAula;
    
    @Column(length = 1000)
    private String comentario;
    
    private String observacao;
    
    @ManyToOne
    @JoinColumn(name = "id_aula")
    private Aula aula;
    
    @ManyToOne
    @JoinColumn(name = "id_aluno")
    private Aluno aluno;

    public Boolean getPresente() {
        return presente;
    }

    public void setPresente(Boolean presente) {
        this.presente = presente;
    }

    public StatusPresenca getStatus() {
        return status;
    }

    public void setStatus(StatusPresenca status) {
        this.status = status;
    }

    public StatusDeverCasa getDeverCasa() {
        return deverCasa;
    }

    public void setDeverCasa(StatusDeverCasa deverCasa) {
        this.deverCasa = deverCasa;
    }

    public StatusPreparacaoAula getPreparacaoAula() {
        return preparacaoAula;
    }

    public void setPreparacaoAula(StatusPreparacaoAula preparacaoAula) {
        this.preparacaoAula = preparacaoAula;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
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
