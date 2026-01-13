package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Perfil {
    PROFESSOR(1, "Professor"),
    ALUNO(2, "Aluno");

    private final Integer id;
    private final String label;

    Perfil(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static Perfil valueOf(Integer id) {
        if (id == null)
            return null;
        for (Perfil perfil : Perfil.values()) {
            if (perfil.getId().equals(id))
                return perfil;
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
