package br.unitins.topicos1.model;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Nivel {
    INICIANTE(1, "Iniciante"),
    BASICO(2, "Básico"),
    INTERMEDIARIO(3, "Intermediário"),
    AVANCADO(4, "Avançado"),
    FLUENTE(5, "Fluente");

    private final Integer id;
    private final String label;

    Nivel(Integer id, String label) {
        this.id = id;
        this.label = label;
    }

    public Integer getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public static Nivel valueOf(Integer id) {
        if (id == null)
            return null;
        for (Nivel nivel : Nivel.values()) {
            if (nivel.getId().equals(id))
                return nivel;
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
