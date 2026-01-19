package br.unitins.topicos1.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class HorarioDia extends DefaultEntity {

    private Integer diaSemana; // 0=Dom, 1=Seg, ..., 6=Sab
    private String diaNome;
    private String horaInicio;
    private String horaFim;
    
    @ManyToOne
    @JoinColumn(name = "id_turma")
    private Turma turma;

    public Integer getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(Integer diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getDiaNome() {
        return diaNome;
    }

    public void setDiaNome(String diaNome) {
        this.diaNome = diaNome;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(String horaFim) {
        this.horaFim = horaFim;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }
}
