package br.unitins.topicos1.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Turma extends DefaultEntity {

    private String nome;
    private Idioma idioma;
    
    @ManyToOne
    @JoinColumn(name = "id_nivel_turma")
    private NivelTurma nivelTurma;
    
    private String horario;
    private String diasSemana;
    
    @ManyToOne
    @JoinColumn(name = "id_professor")
    private Professor professor;
    
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HorarioDia> horariosPorDia;
    
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL)
    private List<Aluno> alunos;
    
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL)
    private List<Aula> aulas;
    
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL)
    private List<Video> videos;
    
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL)
    private List<MaterialExtraAula> materiais;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Idioma getIdioma() {
        return idioma;
    }

    public void setIdioma(Idioma idioma) {
        this.idioma = idioma;
    }

    public NivelTurma getNivelTurma() {
        return nivelTurma;
    }

    public void setNivelTurma(NivelTurma nivelTurma) {
        this.nivelTurma = nivelTurma;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getDiasSemana() {
        return diasSemana;
    }

    public void setDiasSemana(String diasSemana) {
        this.diasSemana = diasSemana;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public List<HorarioDia> getHorariosPorDia() {
        return horariosPorDia;
    }

    public void setHorariosPorDia(List<HorarioDia> horariosPorDia) {
        this.horariosPorDia = horariosPorDia;
    }

    public List<Aluno> getAlunos() {
        return alunos;
    }

    public void setAlunos(List<Aluno> alunos) {
        this.alunos = alunos;
    }

    public List<Aula> getAulas() {
        return aulas;
    }

    public void setAulas(List<Aula> aulas) {
        this.aulas = aulas;
    }

    public List<Video> getVideos() {
        return videos;
    }

    public void setVideos(List<Video> videos) {
        this.videos = videos;
    }

    public List<MaterialExtraAula> getMateriais() {
        return materiais;
    }

    public void setMateriais(List<MaterialExtraAula> materiais) {
        this.materiais = materiais;
    }
}
